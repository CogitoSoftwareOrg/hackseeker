import type { Principal } from '$lib/apps/user/core';

export interface StartPainValidationCmd {
	principal: Principal;
	painId: string;
}
export interface StreamChatCmd {
	principal: Principal;
	chatId: string;
	query: string;
}

export interface EdgeApp {
	startPainValidation(cmd: StartPainValidationCmd): Promise<void>;
	streamChat(cmd: StreamChatCmd): Promise<ReadableStream>;
}
