import type { ChatApp } from '$lib/apps/chat/core';
import { PainsStatusOptions } from '$lib/shared';
import type { Agent, Tool } from '$lib/shared/server';

import {
	type Pain,
	type PainAskCmd,
	type PainAsker,
	type PainCrud,
	type AskMode,
	CreatePainToolSchema,
	UpdatePainToolSchema
} from '../core';

import type { PreparatorImpl } from './preparator';

export class PainAskerImpl implements PainAsker {
	constructor(
		// INTERNAL STRATEGIES
		private readonly preparator: PreparatorImpl,
		private readonly crud: PainCrud,

		// ADAPTERS
		private readonly agents: Record<AskMode, Agent>,

		// APPS
		private readonly chatApp: ChatApp
	) {}

	async ask(cmd: PainAskCmd): Promise<string> {
		const { history, knowledge, aiMsg } = await this.preparator.prepare(
			cmd.mode,
			cmd.chatId,
			cmd.userId,
			cmd.query
		);
		const agent = this.agents[cmd.mode];

		// @ts-expect-error zodFunction is not typed
		const tools: Tool[] = [{ schema: UpdatePainToolSchema, callback: this.crud.update }];
		const pains: Pain[] = [];

		if (cmd.mode === 'discovery') {
			// @ts-expect-error zodFunction is not typed
			tools.push({ schema: CreatePainToolSchema, callback: this.crud.create });
			pains.push(...(await this.crud.getByChatId(cmd.chatId)));
		} else if (cmd.mode === 'validation') {
			pains.push(...(await this.crud.getByChatId(cmd.chatId, PainsStatusOptions.validation)));
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

		await this.chatApp.postProcessMessage(aiMsg!.id, result);

		return result;
	}

	async askStream(cmd: PainAskCmd): Promise<ReadableStream> {
		console.log('pain.askStream');
		const { history, knowledge, aiMsg } = await this.preparator.prepare(
			cmd.mode,
			cmd.chatId,
			cmd.userId,
			cmd.query
		);
		const agent = this.agents[cmd.mode];

		// @ts-expect-error zodFunction is not typed
		const tools: Tool[] = [{ schema: UpdatePainToolSchema, callback: this.crud.update }];
		const pains: Pain[] = [];

		if (cmd.mode === 'discovery') {
			// @ts-expect-error zodFunction is not typed
			tools.push({ schema: CreatePainToolSchema, callback: this.crud.create });
			pains.push(...(await this.crud.getByChatId(cmd.chatId)));
		} else if (cmd.mode === 'validation') {
			pains.push(...(await this.crud.getByChatId(cmd.chatId, PainsStatusOptions.validation)));
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
						controller.enqueue(JSON.stringify({ text: value, msgId: aiMsg!.id }));
					}
					await chatApp.postProcessMessage(aiMsg!.id, content);
				} catch (error) {
					controller.error(error);
				} finally {
					controller.close();
				}
			}
		});
	}
}
