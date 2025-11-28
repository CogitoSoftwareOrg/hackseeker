import type { WorkflowMode } from '$lib/apps/pain/core';
import type { Principal } from '$lib/apps/user/core';

export interface StartPainValidationCmd {
	principal: Principal;
	painId: string;
}
export interface GenPainPdfCmd {
	principal: Principal;
	painId: string;
	chatId: string;
}
export interface GenPainLandingCmd {
	principal: Principal;
	painId: string;
	chatId: string;
}

export interface SearchArtifactsCmd {
	principal: Principal;
	painId: string;
	queryIds: string[];
}

export interface StreamChatCmd {
	mode: WorkflowMode;
	principal: Principal;
	chatId: string;
	query: string;
}

export interface EdgeApp {
	genPainPdf(cmd: GenPainPdfCmd): Promise<void>;
	genPainLanding(cmd: GenPainLandingCmd): Promise<void>;
	searchArtifacts(cmd: SearchArtifactsCmd): Promise<void>;
	startPainValidation(cmd: StartPainValidationCmd): Promise<void>;
	streamChat(cmd: StreamChatCmd): Promise<ReadableStream>;
}
