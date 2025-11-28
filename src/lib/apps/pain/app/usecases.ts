import { Collections, PainsStatusOptions, pb, type PainsResponse } from '$lib/shared';
import type { Tool } from '$lib/apps/llmTools/core';
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
	type WorkflowMode,
	CreatePainToolSchema,
	UpdatePainToolSchema,
	type GenPainPdfCmd,
	type GenPainLandingCmd,
	type Agent,
	type Renderer
} from '../core';

export class PainAppImpl implements PainApp {
	constructor(
		// Adapters
		private readonly agents: Record<WorkflowMode, Agent>,
		private readonly renderer: Renderer,
		// Apps
		private readonly searchApp: SearchApp,
		private readonly artifactApp: ArtifactApp
	) {}

	async genPdf(cmd: GenPainPdfCmd): Promise<void> {
		const pain = await this.getById(cmd.painId);
		cmd.memo.static.push({
			content: pain.prompt,
			kind: 'static',
			tokens: pain.prompt.length
		});

		const agent = this.agents['pdf'];
		const pdfContent = await agent.run({
			tools: [],
			history: cmd.history,
			memo: cmd.memo,
			dynamicArgs: {}
		});
		const pdf = await this.renderer.render(pdfContent);

		const data = new FormData();
		data.append('report', pdf, 'report.pdf');
		await pb.collection(Collections.Pains).update(cmd.painId, data);
	}

	async genLanding(cmd: GenPainLandingCmd): Promise<void> {
		const pain = await this.getById(cmd.painId);
		const agent = this.agents['landing'];

		cmd.memo.static.push({
			content: pain.prompt,
			kind: 'static',
			tokens: pain.prompt.length
		});

		const landing = await agent.run({
			tools: [],
			history: cmd.history,
			memo: cmd.memo,
			dynamicArgs: {}
		});

		const data = new FormData();
		data.append('landing', new Blob([landing]), 'landing.txt');
		await pb.collection(Collections.Pains).update(cmd.painId, data);
	}

	async ask(cmd: PainAskCmd): Promise<string> {
		const agent = this.agents[cmd.mode];

		// @ts-expect-error zodFunction is not typed
		const tools: Tool[] = [{ schema: CreatePainToolSchema, callback: this.create }];
		const pains: Pain[] = [];

		if (cmd.mode === 'discovery') {
			// @ts-expect-error zodFunction is not typed
			tools.push({ schema: UpdatePainToolSchema, callback: this.update });
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
			tools,
			history: cmd.history,
			memo: cmd.memo,
			dynamicArgs: {
				userId: cmd.userId,
				chatId: cmd.chatId
			}
		});

		return result;
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
			tools,
			history: cmd.history,
			memo: cmd.memo,
			dynamicArgs: {
				userId: cmd.userId,
				chatId: cmd.chatId
			}
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
