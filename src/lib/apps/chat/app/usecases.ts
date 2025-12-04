import {
	Collections,
	MessagesRoleOptions,
	MessagesStatusOptions,
	pb,
	type ChatExpand,
	type ChatsResponse,
	ChatsStatusOptions,
	type Update
} from '$lib/shared';
import { LLMS, TOKENIZERS, type Agent } from '$lib/shared/server';
import { getActiveTraceId } from '@langfuse/tracing';

import {
	Chat,
	type ChatApp,
	type ChatEventIndexer,
	type ChatEventMemoryPutCmd,
	type ChatEventMemory,
	type ChatEventMemoryGetCmd,
	type OpenAIMessage,
	type UtilsMode
} from '../core';

export class ChatAppImpl implements ChatApp {
	constructor(
		private readonly agents: Record<UtilsMode, Agent>,
		private readonly chatEventIndexer: ChatEventIndexer
	) {}

	async getMemories(cmd: ChatEventMemoryGetCmd): Promise<ChatEventMemory[]> {
		return this.chatEventIndexer.search(cmd.query, cmd.tokens, cmd.chatId);
	}

	async putMemories(cmd: ChatEventMemoryPutCmd): Promise<void> {
		const memories: ChatEventMemory[] = cmd.dtos.map((dto) => ({
			type: dto.type,
			chatId: dto.chatId,
			content: dto.content,
			importance: dto.importance,
			tokens: TOKENIZERS[LLMS.GROK_4_FAST].encode(dto.content).length
		}));
		await this.chatEventIndexer.add(memories);
	}
	async prepareMessages(chatId: string, query: string) {
		const traceId = getActiveTraceId();

		const chat = await this.getChat(chatId);

		if (chat.data.status === ChatsStatusOptions.empty) {
			this.nameChat(chatId, query);

			await pb.collection(Collections.Chats).update(chatId, {
				status: ChatsStatusOptions.going
			});
		}

		const userMsg = await pb.collection(Collections.Messages).create({
			chat: chatId,
			role: MessagesRoleOptions.user,
			content: query,
			status: MessagesStatusOptions.final,
			metadata: {
				traceId
			}
		});

		const aiMsg = await pb.collection(Collections.Messages).create({
			chat: chatId,
			role: MessagesRoleOptions.ai,
			status: MessagesStatusOptions.streaming,
			content: '',
			metadata: {
				traceId
			}
		});

		return { aiMsg, userMsg };
	}

	async postProcessMessage(aiMsgId: string, content: string) {
		await pb.collection(Collections.Messages).update(aiMsgId, {
			content,
			status: MessagesStatusOptions.final
		});
	}

	async getHistory(chatId: string, tokens: number): Promise<OpenAIMessage[]> {
		const chat = await this.getChat(chatId);
		return this.trimMessages(chat, tokens);
	}

	async update(chatId: string, dto: Update<Collections.Chats>): Promise<Chat> {
		await pb.collection(Collections.Chats).update(chatId, dto);
		return this.getChat(chatId);
	}

	private async getChat(chatId: string): Promise<Chat> {
		const chatRec: ChatsResponse<ChatExpand> = await pb
			.collection(Collections.Chats)
			.getOne(chatId, { expand: 'messages_via_chat' });
		return Chat.fromResponse(chatRec);
	}

	private trimMessages(chat: Chat, tokens: number): OpenAIMessage[] {
		const allMessages = chat.getMessages().filter((msg) => msg.content);
		const reversedMessages = [...allMessages].reverse();

		const messages: OpenAIMessage[] = [];
		let totalTokens = 0;

		for (const msg of reversedMessages) {
			const msgTokens = TOKENIZERS[LLMS.GROK_4_FAST].encode(msg.content).length;
			if (totalTokens + msgTokens > tokens) break;

			totalTokens += msgTokens;
			messages.push({
				role: msg.role === MessagesRoleOptions.user ? 'user' : 'assistant',
				content: msg.content
			});
		}

		messages.reverse();
		return messages;
	}

	private async nameChat(chatId: string, query: string): Promise<void> {
		const name = await this.agents['name'].run({
			history: [{ role: 'user', content: query }],
			knowledge: '',
			tools: [],
			dynamicArgs: {}
		});

		await pb.collection(Collections.Chats).update(chatId, {
			title: name
		});
	}
}
