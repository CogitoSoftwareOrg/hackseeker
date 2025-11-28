import type { ChatCompletionMessageParam } from 'openai/resources';

import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';
import { grok, LLMS } from '$lib/shared/server';

import type { Synthesizer } from '../../core';

const SYNTHESIZER_MODEL = LLMS.GROK_4_1_FAST_NON_REASONING;
const SYNTHESIZER_PROMPT = `
You are a helpful synthesizer and assistant.
You are given a conversation history and relevant memories.
The history may contain results from tool executions (e.g. memory searches or saves).
Use this information to provide a comprehensive and helpful response to the user.
Do not mention the internal tools or the planning process explicitly. Just answer the user naturally.
`;

export class SimpleSynthesizer implements Synthesizer {
	constructor() {}

	async synthesize(history: OpenAIMessage[], memo: MemporyGetResult): Promise<string> {
		const messages = await this.prepare(history, memo);

		const res = await grok.chat.completions.create({
			model: SYNTHESIZER_MODEL,
			messages: messages as ChatCompletionMessageParam[],
			stream: false
		});

		return res.choices[0].message.content || '';
	}

	async synthesizeStream(
		history: OpenAIMessage[],
		memo: MemporyGetResult
	): Promise<ReadableStream> {
		const messages = await this.prepare(history, memo);

		return new ReadableStream({
			async start(controller) {
				try {
					const stream = await grok.chat.completions.create({
						model: SYNTHESIZER_MODEL,
						messages: messages as ChatCompletionMessageParam[],
						stream: true,
						stream_options: { include_usage: true }
					});

					for await (const chunk of stream) {
						if (chunk.choices && chunk.choices.length > 0 && chunk.choices[0]?.delta) {
							const delta = chunk.choices[0].delta;
							if (delta.content) {
								controller.enqueue(delta.content);
							}
						}
					}

					controller.close();
				} catch (error) {
					controller.error(error);
				}
			}
		});
	}

	private async prepare(
		history: OpenAIMessage[],
		memo: MemporyGetResult
	): Promise<OpenAIMessage[]> {
		console.log(
			`Synthesizer received memo: ${memo.event.length} events, ${memo.profile.length} profiles, ${memo.static.length} static`
		);

		const messages: OpenAIMessage[] = [];

		// 1. System Prompt
		messages.push({
			role: 'system',
			content: SYNTHESIZER_PROMPT
		});

		// 2. Memory Context
		if (memo.static && memo.static.length > 0) {
			const parts = memo.static.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `Static memories:\n${parts}`
			});
		}

		if (memo.profile && memo.profile.length > 0) {
			const parts = memo.profile.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `User profile memories:\n${parts}`
			});
		}

		if (memo.event && memo.event.length > 0) {
			const parts = memo.event.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `Chat event memories:\n${parts}`
			});
		}

		// 3. History
		messages.push(...history);

		return messages;
	}
}
