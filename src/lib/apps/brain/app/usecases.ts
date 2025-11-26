import type {
	EventType,
	Importance,
	MemoryApp,
	MemoryGetCmd,
	MemoryPutCmd,
	ProfileType
} from '$lib/apps/memory/core';
import type { PainApp, PainCreateCmd, PainUpdateCmd } from '$lib/apps/pain/core';

import type { BrainApp, BrainRunCmd, Planner, Synthesizer } from '../core';

const ADDITIONAL_MEMORY_TOKENS = 1000;

export class BrainAppImpl implements BrainApp {
	constructor(
		private readonly planner: Planner,
		private readonly synthesizer: Synthesizer,
		private readonly memoryApp: MemoryApp,
		private readonly painApp: PainApp
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
		console.log('Brain.prepare started');
		const { history, memo } = cmd;

		const tools =
			cmd.mode === 'discovery'
				? [
						this.memoryApp.searchTool,
						this.memoryApp.putTool,
						this.painApp.createTool,
						this.painApp.updateTool
					]
				: [this.memoryApp.searchTool, this.memoryApp.putTool, this.painApp.updateTool];

		const toolCalls = await this.planner.plan(history, memo, tools, cmd.mode);

		console.log(`Planner returned ${toolCalls.length} tool calls`);

		if (toolCalls.length > 0) {
			history.push({
				role: 'assistant',
				content: '',
				tool_calls: toolCalls.map((tc) => ({
					id: tc.id,
					type: 'function',
					function: {
						name: tc.name,
						arguments: tc.args ? JSON.stringify(tc.args) : '{}'
					}
				}))
			});
		}

		for (const toolCall of toolCalls) {
			console.log(`Executing tool: ${toolCall.name}`);
			if (toolCall.name === this.memoryApp.searchTool.function.name) {
				console.log(`Memory search tool called with query: ${toolCall.args.query}`);
				const dto: MemoryGetCmd = {
					query: toolCall.args.query as string,
					tokens: ADDITIONAL_MEMORY_TOKENS,
					profileId: cmd.profileId,
					chatId: cmd.chatId
				};
				const result = await this.memoryApp.get(dto);

				console.log(
					`Memory search result: ${result.event?.length || 0} events, ${result.profile?.length || 0} profiles`
				);

				// Append new memories to the current memo object (mutating the original object)
				if (result.event && result.event.length > 0) {
					memo.event.push(...result.event);
					console.log(
						`Added ${result.event.length} events to memo. Total events: ${memo.event.length}`
					);
				}
				if (result.profile && result.profile.length > 0) {
					memo.profile.push(...result.profile);
					console.log(
						`Added ${result.profile.length} profiles to memo. Total profiles: ${memo.profile.length}`
					);
				}

				history.push({
					role: 'tool',
					content: 'Memory searched!',
					tool_call_id: toolCall.id
				});
			} else if (toolCall.name === this.memoryApp.putTool.function.name) {
				console.log(
					`Memory put tool called with profiles: ${JSON.stringify(toolCall.args.profiles)}`
				);
				const dto: MemoryPutCmd = {
					profiles: (
						toolCall.args.profiles as {
							type: ProfileType;
							importance: Importance;
							content: string;
						}[]
					).map((profile) => ({
						profileId: cmd.profileId,
						...profile
					})),
					events: (
						toolCall.args.events as { type: EventType; importance: Importance; content: string }[]
					).map((event) => ({
						chatId: cmd.chatId,
						...event
					}))
				};
				await this.memoryApp.put(dto);
				history.push({
					role: 'tool',
					content: 'Memory saved successfully!',
					tool_call_id: toolCall.id
				});
			} else if (toolCall.name === this.painApp.createTool.function.name) {
				console.log(`Pain create tool called with pain: ${JSON.stringify(toolCall.args)}`);
				const dto: PainCreateCmd = {
					chatId: cmd.chatId,
					segment: toolCall.args.segment as string,
					problem: toolCall.args.problem as string,
					jtbd: toolCall.args.jtbd as string,
					keywords: toolCall.args.keywords as string[]
				};
				await this.painApp.create(dto);
			} else if (toolCall.name === this.painApp.updateTool.function.name) {
				console.log(`Pain update tool called with pain: ${JSON.stringify(toolCall.args)}`);
				const dto: PainUpdateCmd = {
					id: toolCall.args.id as string,
					...toolCall.args
				};
				await this.painApp.update(dto);
			}
		}

		console.log(
			`Brain.prepare completed. Final memo: ${memo.event.length} events, ${memo.profile.length} profiles, ${memo.static.length} static`
		);

		return { history, memo };
	}
}
