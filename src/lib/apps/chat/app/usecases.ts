import type { BrainApp } from '$lib/apps/brain/core';
import type { MemoryApp } from '$lib/apps/memory/core';
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

import {
	Chat,
	type ChatApp,
	type MessageChunk,
	type OpenAIMessage,
	type SendUserMessageCmd
} from '../core';

const HISTORY_TOKENS = 2000;
const INITIAL_MEMORY_TOKENS = 1000;

export class ChatAppImpl implements ChatApp {
	constructor(
		private readonly brainApp: BrainApp,
		private readonly memoryApp: MemoryApp
	) {}

	async run(cmd: SendUserMessageCmd): Promise<string> {
		const { chat, aiMsg, history, memo } = await this.prepare(cmd);

		const content = await this.brainApp.run({
			history,
			memo,
			profileId: cmd.principal.user.id,
			chatId: cmd.chatId,
			mode: chat.mode
		});

		await this.postProcess(aiMsg.id, content);
		return aiMsg.content || '';
	}

	async runStream(cmd: SendUserMessageCmd): Promise<ReadableStream> {
		const { chat, aiMsg, history, memo } = await this.prepare(cmd);
		const postProcess = this.postProcess;
		const brainApp = this.brainApp;
		const encoder = new TextEncoder();

		return new ReadableStream({
			async start(controller) {
				try {
					const sendEvent = (event: string, data: string) => {
						controller.enqueue(encoder.encode(`event: ${event}\n`));
						controller.enqueue(encoder.encode(`data: ${data}\n\n`));
					};

					let content = '';

					const stream = await brainApp.runStream({
						history,
						memo,
						profileId: cmd.principal.user.id,
						chatId: cmd.chatId,
						mode: chat.mode
					});

					const reader = stream.getReader();

					try {
						while (true) {
							const { done, value } = await reader.read();

							if (done) {
								break;
							}

							if (value) {
								const chunk: MessageChunk = {
									text: value,
									msgId: aiMsg.id
								};
								content += value;
								sendEvent('chunk', JSON.stringify(chunk));
							}
						}
					} finally {
						reader.releaseLock();
					}

					await postProcess(aiMsg.id, content);
					sendEvent('done', '');
					controller.close();
				} catch (error) {
					controller.error(error);
				}
			}
		});
	}

	private async prepare(cmd: SendUserMessageCmd) {
		const chatRec: ChatsResponse<ChatExpand> = await pb
			.collection(Collections.Chats)
			.getOne(cmd.chatId, { expand: 'messages_via_chat' });
		const chat = Chat.fromResponse(chatRec);
		const history = this.trimMessages(chat, HISTORY_TOKENS);

		if (chat.data.status === ChatsStatusOptions.empty) {
			await pb.collection(Collections.Chats).update(cmd.chatId, {
				status: ChatsStatusOptions.going
			});
		}

		const userMsg = await pb.collection(Collections.Messages).create({
			chat: cmd.chatId,
			role: MessagesRoleOptions.user,
			content: cmd.query,
			status: MessagesStatusOptions.final
		});
		history.push({
			role: 'user',
			content: userMsg.content
		});

		const aiMsg = await pb.collection(Collections.Messages).create({
			chat: cmd.chatId,
			role: MessagesRoleOptions.ai,
			status: MessagesStatusOptions.streaming,
			content: ''
		});

		const memo = await this.memoryApp.get({
			profileId: cmd.principal.user.id,
			query: cmd.query,
			chatId: cmd.chatId,
			tokens: INITIAL_MEMORY_TOKENS
		});

		return { chat, aiMsg, history, memo };
	}

	private async postProcess(aiMsgId: string, content: string) {
		await pb.collection(Collections.Messages).update(aiMsgId, {
			content,
			status: MessagesStatusOptions.final
		});
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
