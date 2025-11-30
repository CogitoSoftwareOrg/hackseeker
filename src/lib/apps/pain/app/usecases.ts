import {
	Collections,
	PainsStatusOptions,
	pb,
	type MessagesResponse,
	type PainsResponse
} from '$lib/shared';
import type { Tool } from '$lib/apps/llmTools/core';
import type { SearchApp } from '$lib/apps/search/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { ChatApp, OpenAIMessage } from '$lib/apps/chat/core';
import type { MemoryApp } from '$lib/apps/memory/core';

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

const HISTORY_TOKENS = 2000;
const MEMORY_TOKENS = 5000;

export class PainAppImpl implements PainApp {
	constructor(
		// Adapters
		private readonly agents: Record<WorkflowMode, Agent>,
		private readonly renderer: Renderer,
		// Apps
		private readonly searchApp: SearchApp,
		private readonly chatApp: ChatApp,
		private readonly artifactApp: ArtifactApp,
		private readonly memoryApp: MemoryApp
	) {}

	async genPdf(cmd: GenPainPdfCmd): Promise<void> {
		const { history } = await this.prepare(cmd.mode, cmd.chatId, cmd.userId, '');

		const agent = this.agents['pdf'];
		const pdfContent = await agent.run({
			tools: [],
			history,
			dynamicArgs: {}
		});
		const pdf = await this.renderer.render(pdfContent);

		const data = new FormData();
		data.append('report', pdf, 'report.pdf');
		await pb.collection(Collections.Pains).update(cmd.painId, data);
	}

	async genLanding(cmd: GenPainLandingCmd): Promise<void> {
		const { history } = await this.prepare(cmd.mode, cmd.chatId, cmd.userId, '');
		const agent = this.agents['landing'];

		const landing = await agent.run({
			tools: [],
			history,
			dynamicArgs: {}
		});

		const data = new FormData();
		data.append('landing', new Blob([landing]), 'landing.txt');
		await pb.collection(Collections.Pains).update(cmd.painId, data);
	}

	async ask(cmd: PainAskCmd): Promise<string> {
		const { history, aiMsg } = await this.prepare(cmd.mode, cmd.chatId, cmd.userId, cmd.query);
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

		const result = await agent.run({
			tools,
			history,
			dynamicArgs: {
				userId: cmd.userId,
				chatId: cmd.chatId
			}
		});

		await this.chatApp.postProcessMessage(aiMsg.id, result);

		return result;
	}

	async askStream(cmd: PainAskCmd): Promise<ReadableStream> {
		console.log('pain.askStream');
		const { history, aiMsg } = await this.prepare(cmd.mode, cmd.chatId, cmd.userId, cmd.query);
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

		const chatApp = this.chatApp;

		return new ReadableStream({
			async start(controller) {
				try {
					let content = '';
					const stream = await agent.runStream({
						tools,
						history: history,
						dynamicArgs: {
							userId: cmd.userId,
							chatId: cmd.chatId
						}
					});
					const reader = stream.getReader();
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						content += value;
						controller.enqueue(JSON.stringify({ text: value, msgId: aiMsg.id }));
					}
					await chatApp.postProcessMessage(aiMsg.id, content);
				} catch (error) {
					controller.error(error);
				} finally {
					controller.close();
				}
			}
		});
	}

	async startValidation(painId: string): Promise<Pain> {
		const painRec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(painId, { status: PainsStatusOptions.validation });
		const pain = Pain.fromResponse(painRec);

		await this.searchApp.generateQueries(painId, pain.prompt);

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

	private async prepare(
		mode: WorkflowMode,
		chatId: string,
		userId: string,
		query: string
	): Promise<{ history: OpenAIMessage[]; aiMsg: MessagesResponse; userMsg: MessagesResponse }> {
		const { aiMsg, userMsg } = await this.chatApp.prepareMessages(chatId, query);

		// Static Pain Knowledge
		const status = mode === 'validation' ? PainsStatusOptions.validation : undefined;
		const history: OpenAIMessage[] = (await this.getByChatId(chatId, status)).map((pain) => {
			return {
				role: 'user',
				content: pain.prompt
			};
		});

		// Chat History
		history.push(...(await this.chatApp.getHistory(chatId, HISTORY_TOKENS)));

		const memo = await this.memoryApp.get({
			profileId: userId,
			query: query,
			chatId: chatId,
			tokens: MEMORY_TOKENS
		});

		if (memo.profile.length > 0) {
			history.push({ role: 'system', content: 'Memories about the user:' });
			history.push(
				...memo.profile.map((p) => {
					return { role: 'user', content: p.content } as OpenAIMessage;
				})
			);
		}

		if (memo.event.length > 0) {
			history.push({ role: 'system', content: 'Event memories:' });
			history.push(
				...memo.event.map((p) => {
					return { role: 'user', content: p.content } as OpenAIMessage;
				})
			);
		}

		return { history, aiMsg, userMsg };
	}
}
