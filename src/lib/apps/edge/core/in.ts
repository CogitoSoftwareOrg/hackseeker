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

export interface SearchArtifactsCmd {
	principal: Principal;
	painId: string;
	queryIds: string[];
}
export interface EdgeApp {
	searchArtifacts(cmd: SearchArtifactsCmd): Promise<void>;
	startPainValidation(cmd: StartPainValidationCmd): Promise<void>;
	streamChat(cmd: StreamChatCmd): Promise<ReadableStream>;
}
