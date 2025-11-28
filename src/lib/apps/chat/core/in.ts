import type { Principal } from '$lib/apps/user/core';
import type { MessagesResponse } from '$lib/shared';

import type { OpenAIMessage } from './models';

export interface SendUserMessageCmd {
	principal: Principal;
	chatId: string;
	query: string;
}

export interface ChatApp {
	postProcessMessage(aiMsgId: string, content: string): Promise<void>;

	prepareMessages(
		chatId: string,
		query: string
	): Promise<{ aiMsg: MessagesResponse; userMsg: MessagesResponse }>;
	getHistory(chatId: string, tokens: number): Promise<OpenAIMessage[]>;
}
