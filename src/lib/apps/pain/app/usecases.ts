import {
	Collections,
	PainsStatusOptions,
	pb,
	type MessagesResponse,
	type PainsResponse
} from '$lib/shared';
import type { Tool } from '$lib/shared/server';
import type { SearchApp } from '$lib/apps/search/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { ChatApp, OpenAIMessage } from '$lib/apps/chat/core';
import type { Agent } from '$lib/shared/server';
import type { UserApp } from '$lib/apps/user/core';

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
	type Renderer
} from '../core';

const HISTORY_TOKENS = 2000;
const USER_TOKENS = 5000;
const CHAT_EVENT_TOKENS = 5000;
const ARTIFCAT_TOKENS = 5000;

export class PainAppImpl implements PainApp {
	constructor(
		// Adapters
		private readonly agents: Record<WorkflowMode, Agent>,
		private readonly renderer: Renderer,
		// Apps
		private readonly searchApp: SearchApp,
		private readonly chatApp: ChatApp,
		private readonly artifactApp: ArtifactApp,
		private readonly userApp: UserApp
	) {}

	async genPdf(cmd: GenPainPdfCmd): Promise<void> {
		const { history, knowledge } = await this.prepare(cmd.mode, cmd.chatId, cmd.userId, '');

		const agent = this.agents['pdf'];
		const pdfContent = await agent.run({
			tools: [],
			history,
			knowledge,
			dynamicArgs: {}
		});
		const pdf = await this.renderer.render(pdfContent);

		const data = new FormData();
		data.append('report', pdf, 'report.pdf');
		await pb.collection(Collections.Pains).update(cmd.painId, data);
	}

	async genLanding(cmd: GenPainLandingCmd): Promise<void> {
		const { history, knowledge } = await this.prepare(cmd.mode, cmd.chatId, cmd.userId, '');
		const agent = this.agents['landing'];

		const landing = await agent.run({
			tools: [],
			history,
			knowledge,
			dynamicArgs: {}
		});

		const data = new FormData();
		data.append('landing', new Blob([landing]), 'landing.txt');
		await pb.collection(Collections.Pains).update(cmd.painId, data);
	}

	async ask(cmd: PainAskCmd): Promise<string> {
		const { history, knowledge, aiMsg } = await this.prepare(
			cmd.mode,
			cmd.chatId,
			cmd.userId,
			cmd.query
		);
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
			knowledge,
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
		const { history, knowledge, aiMsg } = await this.prepare(
			cmd.mode,
			cmd.chatId,
			cmd.userId,
			cmd.query
		);
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
						knowledge,
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
	): Promise<{
		history: OpenAIMessage[];
		aiMsg: MessagesResponse;
		userMsg: MessagesResponse;
		knowledge: string;
	}> {
		const { aiMsg, userMsg } = await this.chatApp.prepareMessages(chatId, query);

		const history = await this.chatApp.getHistory(chatId, HISTORY_TOKENS);

		const knowledge = await this.buildKnowledge(mode, userId, chatId, query);

		return { history, aiMsg, userMsg, knowledge };
	}

	private async buildKnowledge(
		mode: WorkflowMode,
		userId: string,
		chatId: string,
		query: string
	): Promise<string> {
		let knowledge = '';

		const status = mode === 'validation' ? PainsStatusOptions.validation : undefined;
		const pains = await this.getByChatId(chatId, status);
		knowledge += pains
			.map((pain) => {
				return `- ${pain.prompt}`;
			})
			.join('\n');

		const userMemories = await this.userApp.getMemories({
			userId: userId,
			query: query,
			tokens: USER_TOKENS
		});
		if (userMemories.length > 0) {
			knowledge += '\n\nUser memories:';
			knowledge += userMemories.map((user) => `- ${user.content}`).join('\n');
		}

		const chatEventMemories = await this.chatApp.getMemories({
			chatId: chatId,
			query: query,
			tokens: CHAT_EVENT_TOKENS
		});
		if (chatEventMemories.length > 0) {
			knowledge += '\n\nChat event memories:';
			knowledge += chatEventMemories.map((chatEvent) => `- ${chatEvent.content}`).join('\n');
		}

		if (mode === 'validation') {
			const pain = pains[0]!;
			const artifactMemories = await this.artifactApp.getMemories({
				userId: userId,
				painId: pain.data.id,
				query: query,
				tokens: ARTIFCAT_TOKENS
			});
			if (artifactMemories.length > 0) {
				knowledge += '\n\nArtifact memories:';
				knowledge += artifactMemories.map((artifact) => `- ${artifact.data.payload}`).join('\n');
			}
		}

		return knowledge;
	}
}
