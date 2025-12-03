import {
	PainsStatusOptions,
	type ChatExpand,
	type ChatsResponse,
	type MessagesResponse
} from '$lib';
import type { AskMode } from '$lib/apps/pain/core';

export type Sender = {
	id: string;
	avatar: string;
	name: string;
	role: string;
};

export type MessageChunk = {
	text: string;
	msgId: string;
	i?: number;
};

export type OpenAIMessage = {
	role: 'user' | 'assistant' | 'system' | 'tool';
	content: string;
	tool_calls?: {
		id: string;
		type: 'function';
		function: {
			name: string;
			arguments: string;
		};
	}[];
	tool_call_id?: string;
	tool_call_name?: string;
	tool_call_args?: Record<string, unknown>;
};

export enum EventType {
	Story = 'story',
	Chat = 'chat',
	Action = 'action',
	Decision = 'decision'
}
export enum Importance {
	Low = 'low',
	Medium = 'medium',
	High = 'high'
}

export type UtilsMode = 'name';

export type ChatEventMemory = {
	type: EventType;
	content: string;
	chatId: string;
	tokens: number;
	importance: Importance;
};
export class Chat {
	constructor(
		public readonly data: ChatsResponse<ChatExpand>,
		public readonly mode: AskMode
	) {}

	static fromResponse(res: ChatsResponse<ChatExpand>): Chat {
		const pains = res.expand?.pains_via_chats || [];
		const validationPains = pains.filter((pain) => pain.status === PainsStatusOptions.validation);
		return new Chat(res, validationPains.length > 0 ? 'validation' : 'discovery');
	}

	getMessages(): MessagesResponse[] {
		return (this.data.expand?.messages_via_chat as MessagesResponse[]) || [];
	}
}
