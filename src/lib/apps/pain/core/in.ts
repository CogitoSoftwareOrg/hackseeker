import type { Tool } from '$lib/apps/brain/core';

import type { Pain } from './models';

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

export interface PainApp {
	createTool: Tool;
	updateTool: Tool;

	getByChatId(chatId: string): Promise<Pain[]>;

	getById(id: string): Promise<Pain>;
	create(cmd: PainCreateCmd): Promise<Pain>;
	update(cmd: PainUpdateCmd): Promise<Pain>;

	startValidation(painId: string): Promise<Pain>;
}
