import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';

import type { Pain, WorkflowMode } from './models';

export type PainCreateCmd = {
	chatId: string;
	userId: string;

	segment: string;
	problem: string;
	jtbd: string;
	keywords: string[];
};

export type PainUpdateCmd = {
	id: string;

	segment?: string;
	problem?: string;
	jtbd?: string;
	keywords?: string[];
};

export interface GenPainPdfCmd {
	history: OpenAIMessage[];
	memo: MemporyGetResult;
	painId: string;
}

export interface GenPainLandingCmd {
	history: OpenAIMessage[];
	painId: string;
	memo: MemporyGetResult;
}

export interface PainAskCmd {
	mode: WorkflowMode;
	userId: string;
	chatId: string;
	history: OpenAIMessage[];
	memo: MemporyGetResult;
}

export interface PainApp {
	ask(cmd: PainAskCmd): Promise<string>;
	askStream(cmd: PainAskCmd): Promise<ReadableStream>;

	genPdf(cmd: GenPainPdfCmd): Promise<void>;
	genLanding(cmd: GenPainLandingCmd): Promise<void>;

	getByChatId(chatId: string): Promise<Pain[]>;

	getById(id: string): Promise<Pain>;
	create(cmd: PainCreateCmd): Promise<Pain>;
	update(cmd: PainUpdateCmd): Promise<Pain>;

	startValidation(painId: string): Promise<Pain>;
}
