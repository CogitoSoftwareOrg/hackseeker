import type { Agent, BrainApp, BrainRunCmd, WorkflowMode } from '../core';

export class BrainAppImpl implements BrainApp {
	constructor(private readonly agents: Record<WorkflowMode, Agent>) {}

	async run(cmd: BrainRunCmd): Promise<string> {
		const agent = this.agents[cmd.mode];
		const result = await agent.run({
			profileId: cmd.profileId,
			chatId: cmd.chatId,
			history: cmd.history,
			memo: cmd.memo
		});

		// Return the last assistant message content
		const lastMessage = result.history[result.history.length - 1];
		return lastMessage?.content || '';
	}

	async runStream(cmd: BrainRunCmd): Promise<ReadableStream> {
		const agent = this.agents[cmd.mode];
		return agent.runStream({
			profileId: cmd.profileId,
			chatId: cmd.chatId,
			history: cmd.history,
			memo: cmd.memo
		});
	}
}
