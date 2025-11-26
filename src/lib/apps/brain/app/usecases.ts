import type { Agent, BrainApp, BrainRunCmd, Synthesizer, WorkflowMode } from '../core';

export class BrainAppImpl implements BrainApp {
	constructor(
		private readonly agents: Record<WorkflowMode, Agent>,
		private readonly synthesizer: Synthesizer
	) {}

	async run(cmd: BrainRunCmd): Promise<string> {
		const { history, memo } = await this.prepare(cmd);
		return await this.synthesizer.synthesize(history, memo);
	}

	async runStream(cmd: BrainRunCmd): Promise<ReadableStream> {
		const { history, memo } = await this.prepare(cmd);
		return await this.synthesizer.synthesizeStream(history, memo);
	}

	private async prepare(cmd: BrainRunCmd) {
		console.log(`Brain.prepare started with mode: ${cmd.mode}`);

		const agent = this.agents[cmd.mode];
		const result = await agent.run({
			profileId: cmd.profileId,
			chatId: cmd.chatId,
			history: cmd.history,
			memo: cmd.memo
		});

		console.log(
			`Brain.prepare completed. Final memo: ${result.memo.event.length} events, ${result.memo.profile.length} profiles, ${result.memo.static.length} static`
		);

		return result;
	}
}
