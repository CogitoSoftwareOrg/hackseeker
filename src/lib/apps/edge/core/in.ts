import type { Principal } from '$lib/apps/user/core';

export interface StreamChatCmd {
	principal: Principal;
	chatId: string;
	query: string;
}

export interface EdgeApp {
	streamChat(cmd: StreamChatCmd): Promise<ReadableStream>;
}
