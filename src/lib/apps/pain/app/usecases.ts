import z from 'zod';
import { zodFunction } from 'openai/helpers/zod.js';

import { Collections, PainsStatusOptions, pb, type PainsResponse } from '$lib/shared';
import type { Tool } from '$lib/apps/brain/core';
import type { SearchApp } from '$lib/apps/search/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';

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

	constructor(
		private readonly searchApp: SearchApp,
		private readonly artifactApp: ArtifactApp
	) {
		this.createTool = zodFunction({
			name: 'create_pain',
			description: 'Create a new pain draft',
			parameters: z.object({
				segment: z.string().describe('The segment of the pain. 1-3 words max.'),
				problem: z
					.string()
					.describe('The problem exprienced by the segment. 1 small sentence max.'),
				jtbd: z.string().describe('The job to be done for the segment. 1 small sentence max.'),
				keywords: z.array(z.string()).describe('The keywords to search for the pain')
			})
		});
		this.updateTool = zodFunction({
			name: 'update_pain',
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

	async startValidation(painId: string): Promise<Pain> {
		const painRec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(painId, { status: PainsStatusOptions.validation });
		const pain = Pain.fromResponse(painRec);
		const userId = painRec.user;

		const queries = await this.searchApp.generateQueries(painId, pain.prompt);
		const results = await this.searchApp.searchQueries(queries);

		await Promise.all(
			results.map(async (result) => {
				if (result.length === 0) return [];
				return this.artifactApp.extract({
					userId,
					painId,
					searchQueryId: result[0].id,
					dtos: result
				});
			})
		);

		return pain;
	}

	async getByChatId(chatId: string): Promise<Pain[]> {
		const recs: PainsResponse<PainKeywords, PainMetrics>[] = await pb
			.collection(Collections.Pains)
			.getFullList({
				filter: `chats ?= "${chatId}" && archived = null`
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
			.create({ ...cmd, status: PainsStatusOptions.draft, chats: [cmd.chatId], user: cmd.userId });
		return Pain.fromResponse(rec);
	}

	async update(cmd: PainUpdateCmd) {
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(cmd.id, cmd);
		return Pain.fromResponse(rec);
	}
}
