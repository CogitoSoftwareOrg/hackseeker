import {
	Collections,
	MessagesRoleOptions,
	MessagesStatusOptions,
	pb,
	type ChatExpand,
	type ChatsResponse,
	ChatsStatusOptions
} from '$lib/shared';
import { LLMS, TOKENIZERS } from '$lib/shared/server';

import { Chat, type ChatApp, type OpenAIMessage } from '../core';

export class ChatAppImpl implements ChatApp {
	constructor() {}
	async prepareMessages(chatId: string, query: string) {
		const chat = await this.getChat(chatId);

		if (chat.data.status === ChatsStatusOptions.empty) {
			await pb.collection(Collections.Chats).update(chatId, {
				status: ChatsStatusOptions.going
			});
		}

		const userMsg = await pb.collection(Collections.Messages).create({
			chat: chatId,
			role: MessagesRoleOptions.user,
			content: query,
			status: MessagesStatusOptions.final
		});

		const aiMsg = await pb.collection(Collections.Messages).create({
			chat: chatId,
			role: MessagesRoleOptions.ai,
			status: MessagesStatusOptions.streaming,
			content: ''
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
}
