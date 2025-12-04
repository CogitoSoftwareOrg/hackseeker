import type { ChatCompletionMessageParam } from 'openai/resources';
import {
	observe
	// updateActiveObservation
} from '@langfuse/tracing';

import type { Agent, AgentRunCmd, Tool } from '$lib/shared/server';
import {
	grok,
	// openai,
	LLMS
} from '$lib/shared/server';

const OBSERVATION_NAME = 'namer-agent';
const OBSERVATION_TYPE = 'tool';
const AGENT_MODEL = LLMS.GROK_4_1_FAST_NON_REASONING;
const llm = grok;

export const NAMER_PROMPT = `
[HIGH-LEVEL ROLE AND PURPOSE]
You are NamerAgent, a name generator assistant.
Your primary purpose is to generate useful short name based on high-level query intend of a user. Be creative and useful

[KNOWLEDGE]
{KNOWLEDGE}

[OUTPUT FORMAT]
- Plain text. Never use markdown or any other formatting.
- Maximum 3 words.
- Separated by a space, simple and meaningful.
`;

export class NamerAgent implements Agent {
	public readonly tools: Tool[] = [];

	run = observe(
		async (cmd: AgentRunCmd): Promise<string> => {
			const { history, knowledge } = cmd;
			const messages = this.buildMessages(history as ChatCompletionMessageParam[], knowledge);

			// Final response (no tools)
			const res = await llm.chat.completions.create({
				model: AGENT_MODEL,
				messages,
				stream: false
			});

			const content = res.choices[0].message.content || '';
			history.push({ role: 'assistant', content });

			return content;
		},
		{
			name: OBSERVATION_NAME,
			asType: OBSERVATION_TYPE
		}
	);

	runStream = observe(
		async (cmd: AgentRunCmd): Promise<ReadableStream> => {
			const { history, knowledge } = cmd;
			const messages = this.buildMessages(history as ChatCompletionMessageParam[], knowledge);

			// Stream only the final response
			const res = await llm.chat.completions.create({
				model: AGENT_MODEL,
				messages,
				stream: true,
				stream_options: { include_usage: true }
			});

			return new ReadableStream({
				async start(controller) {
					for await (const chunk of res) {
						const delta = chunk.choices[0]?.delta;
						if (delta?.content) {
							controller.enqueue(delta.content);
						}
					}
					controller.close();
				}
			});
		},
		{
			name: OBSERVATION_NAME,
			asType: OBSERVATION_TYPE
		}
	);

	private buildMessages(
		history: ChatCompletionMessageParam[],
		knowledge: string
	): ChatCompletionMessageParam[] {
		const messages: ChatCompletionMessageParam[] = [
			{
				role: 'system',
				content: this.buildPrompt(knowledge)
			}
		];
		if (history.length > 0) {
			messages.push({
				role: 'system',
				content: '[CHAT HISTORY]:'
			});
			messages.push(...history);
		}
		return messages;
	}

	private buildPrompt(knowledge: string): string {
		return NAMER_PROMPT.replaceAll('{KNOWLEDGE}', knowledge);
	}
}
