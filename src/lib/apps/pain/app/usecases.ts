import { Collections, PainsStatusOptions, pb, type PainsResponse } from '$lib/shared';
import type { Agent, Tool } from '$lib/apps/llmTools/core';
import type { SearchApp } from '$lib/apps/search/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';

import {
	Pain,
	type PainApp,
	type PainAskCmd,
	type PainCreateCmd,
	type PainKeywords,
	type PainMetrics,
	type PainUpdateCmd,
	type WorkflowMode
} from '../core';
import { createPainTool, updatePainTool } from '../adapters';

export class PainAppImpl implements PainApp {
	constructor(
		private readonly agents: Record<WorkflowMode, Agent>,

		private readonly searchApp: SearchApp,
		private readonly artifactApp: ArtifactApp
	) {}

	async ask(cmd: PainAskCmd): Promise<string> {
		const agent = this.agents[cmd.mode];

		// @ts-expect-error zodFunction is not typed
		const tools: Tool[] = [{ schema: createPainTool, callback: this.create }];
		const pains: Pain[] = [];

		if (cmd.mode === 'discovery') {
			// @ts-expect-error zodFunction is not typed
			tools.push({ schema: updatePainTool, callback: this.update });
			pains.push(...(await this.getByChatId(cmd.chatId, PainsStatusOptions.draft)));
		} else if (cmd.mode === 'validation') {
			pains.push(...(await this.getByChatId(cmd.chatId, PainsStatusOptions.validation)));
		}

		for (const pain of pains) {
			cmd.memo.static.push({
				content: pain.prompt,
				kind: 'static',
				tokens: pain.prompt.length
			});
		}

		const result = await agent.run({
			userId: cmd.userId,
			chatId: cmd.chatId,
			tools,
			history: cmd.history,
			memo: cmd.memo
		});

		// Return the last assistant message content
		const lastMessage = result.history[result.history.length - 1];
		return lastMessage?.content || '';
	}

	async askStream(cmd: PainAskCmd): Promise<ReadableStream> {
		const agent = this.agents[cmd.mode];

		// @ts-expect-error zodFunction is not typed
		const tools: Tool[] = [{ schema: createPainTool, callback: this.create }];
		const pains: Pain[] = [];

		if (cmd.mode === 'discovery') {
			// @ts-expect-error zodFunction is not typed
			tools.push({ schema: updatePainTool, callback: this.update });
			pains.push(...(await this.getByChatId(cmd.chatId, PainsStatusOptions.draft)));
		} else if (cmd.mode === 'validation') {
			pains.push(...(await this.getByChatId(cmd.chatId, PainsStatusOptions.validation)));
		}

		for (const pain of pains) {
			cmd.memo.static.push({
				content: pain.prompt,
				kind: 'static',
				tokens: pain.prompt.length
			});
		}

		return agent.runStream({
			userId: cmd.userId,
			chatId: cmd.chatId,
			tools,
			history: cmd.history,
			memo: cmd.memo
		});
	}

	async startValidation(painId: string): Promise<Pain> {
		const painRec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(painId, { status: PainsStatusOptions.validation });
		const pain = Pain.fromResponse(painRec);
		// const userId = painRec.user;

		const queries = await this.searchApp.generateQueries(painId, pain.prompt);
		console.log('queries', queries);
		// const results = await this.searchApp.searchQueries(queries);
		// await Promise.all(
		// 	results.map(async (result) => {
		// 		if (result.length === 0) return [];
		// 		return this.artifactApp.extract({
		// 			userId,
		// 			painId,
		// 			searchQueryId: result[0].id,
		// 			dtos: result
		// 		});
		// 	})
		// );

		return pain;
	}

	async getByChatId(chatId: string, status?: PainsStatusOptions): Promise<Pain[]> {
		const recs: PainsResponse<PainKeywords, PainMetrics>[] = await pb
			.collection(Collections.Pains)
			.getFullList({
				filter: status
					? `chats:each = "${chatId}" && archived = null && status = "${status}"`
					: `chats:each = "${chatId}" && archived = null`
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
		const dto = {
			segment: cmd.segment ?? undefined,
			problem: cmd.problem ?? undefined,
			jtbd: cmd.jtbd ?? undefined,
			keywords: cmd.keywords ?? undefined
		};
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(cmd.id, dto);
		return Pain.fromResponse(rec);
	}
}
