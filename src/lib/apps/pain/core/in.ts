import type { PainsStatusOptions } from '$lib/shared';

import type { Pain, AskMode } from './models';

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
	chatId: string;
	userId: string;
	painId: string;
}

export interface GenPainLandingCmd {
	chatId: string;
	userId: string;
	painId: string;
}

export interface PainAskCmd {
	mode: AskMode;
	userId: string;
	chatId: string;
	query: string;
}

export interface PainCrud {
	getByChatId(chatId: string, status?: PainsStatusOptions): Promise<Pain[]>;
	getById(id: string): Promise<Pain>;
	create(cmd: PainCreateCmd): Promise<Pain>;
	update(cmd: PainUpdateCmd): Promise<Pain>;
}

// PUBLIC INTERFACES
export interface PainAsker {
	ask(cmd: PainAskCmd): Promise<string>;
	askStream(cmd: PainAskCmd): Promise<ReadableStream>;
}
export interface PainGenerator {
	genPdf(cmd: GenPainPdfCmd): Promise<void>;
	genLanding(cmd: GenPainLandingCmd): Promise<void>;
}

export interface PainValidator {
	startValidation(painId: string): Promise<Pain>;
}

export interface PainApp extends PainAsker, PainGenerator, PainValidator {}
