import { Collections, pb } from '$lib';
import type { Agent } from '$lib/shared/server';

import type { GenPainLandingCmd, GenPainPdfCmd, PainGenerator, Renderer, GenMode } from '../core';

import type { PreparatorImpl } from './preparator';

export class PainGeneratorImpl implements PainGenerator {
	constructor(
		private readonly preparator: PreparatorImpl,
		private readonly agents: Record<GenMode, Agent>,
		private readonly renderer: Renderer
	) {}

	async genPdf(cmd: GenPainPdfCmd): Promise<void> {
		const { history, knowledge } = await this.preparator.prepare('pdf', cmd.chatId, cmd.userId, '');

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
		const { history, knowledge } = await this.preparator.prepare(
			'landing',
			cmd.chatId,
			cmd.userId,
			''
		);
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
}
