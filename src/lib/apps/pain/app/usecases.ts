import z from 'zod';
import { zodFunction } from 'openai/helpers/zod.js';

import { Collections, PainsStatusOptions, pb, type PainsResponse } from '$lib/shared';
import type { Tool } from '$lib/apps/brain/core';

import {
	Pain,
	type PainApp,
	type PainCreateCmd,
	type PainKeywords,
	type PainMetrics,
	type PainUpdateCmd
} from '../core';

export class PainAppImpl implements PainApp {
	createTool: Tool;
	updateTool: Tool;

	constructor() {
		this.createTool = zodFunction({
			name: 'create_pain_draft',
			description: 'Create a new pain draft',
			parameters: z.object({
				segment: z.string().describe('The segment of the pain.'),
				problem: z.string().describe('The problem exprienced by the segment.'),
				jtbd: z.string().describe('The job to be done for the segment'),
				keywords: z.array(z.string()).describe('The keywords to search for the pain')
			})
		});
		this.updateTool = zodFunction({
			name: 'update_pain_draft',
			description: 'Update a pain draft',
			parameters: z.object({
				id: z.string().describe('The id of the pain'),
				segment: z.string().describe('The segment of the pain.').optional().nullable(),
				problem: z
					.string()
					.describe('The problem exprienced by the segment.')
					.optional()
					.nullable(),
				jtbd: z.string().describe('The job to be done for the segment').optional().nullable(),
				keywords: z
					.array(z.string())
					.describe('The keywords to search for the pain')
					.optional()
					.nullable()
			})
		});
	}

	async getByChatId(chatId: string): Promise<Pain[]> {
		const recs: PainsResponse<PainKeywords, PainMetrics>[] = await pb
			.collection(Collections.Pains)
			.getFullList({
				filter: `chats ?= "${chatId}"`
			});
		return recs.map(Pain.fromResponse);
	}

	async getById(id: string): Promise<Pain> {
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.getOne(id);
		return Pain.fromResponse(rec);
	}

	async create(cmd: PainCreateCmd) {
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.create({ ...cmd, status: PainsStatusOptions.draft, chats: [cmd.chatId] });
		return Pain.fromResponse(rec);
	}

	async update(cmd: PainUpdateCmd) {
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(cmd.id, cmd);
		return Pain.fromResponse(rec);
	}
}
