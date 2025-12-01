import type { Principal } from '$lib/apps/user/core';
import type { MessagesResponse } from '$lib/shared';

import type { ChatEventMemory, EventType, Importance, OpenAIMessage } from './models';

export type ChatEventMemoryGetCmd = {
	query: string;
	tokens: number;
	chatId: string;
};

export type ChatEventMemoryPutCmd = {
	dtos: { chatId: string; content: string; importance: Importance; type: EventType }[];
};

export interface SendUserMessageCmd {
	principal: Principal;
	chatId: string;
	query: string;
}

export interface ChatApp {
	getMemories(cmd: ChatEventMemoryGetCmd): Promise<ChatEventMemory[]>;
	putMemories(cmd: ChatEventMemoryPutCmd): Promise<void>;

	postProcessMessage(aiMsgId: string, content: string): Promise<void>;

	prepareMessages(
		chatId: string,
		query: string
	): Promise<{ aiMsg: MessagesResponse; userMsg: MessagesResponse }>;
	getHistory(chatId: string, tokens: number): Promise<OpenAIMessage[]>;
}
