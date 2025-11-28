import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { grok, LLMS } from '$lib/shared/server';

import type { Tool, ToolCall } from '$lib/apps/llmTools/core';

import { type Agent, type AgentRunCmd } from '../../core';
import { DISCOVERY_PROMPT } from './prompts';

const AGENT_MODEL = LLMS.GROK_4_1_FAST;
const MAX_LOOP_ITERATIONS = 5;
const llm = grok;

export class DiscoveryAgent implements Agent {
	constructor(public readonly tools: Tool[]) {}

	async run(cmd: AgentRunCmd): Promise<string> {
		const { dynamicArgs, tools, history } = cmd;
		const messages: ChatCompletionMessageParam[] = [
			...(history as ChatCompletionMessageParam[]),
			{
				role: 'system',
				content: `${DISCOVERY_PROMPT}`
			}
		];

		// Run tool loop
		await this.runToolLoop(messages, dynamicArgs, [...tools, ...this.tools]);

		// Final response (no tools)
		const res = await llm.chat.completions.create({
			model: AGENT_MODEL,
			messages,
			stream: false
		});

		const content = res.choices[0].message.content || '';
		history.push({ role: 'assistant', content });

		return content;
	}

	async runStream(cmd: AgentRunCmd): Promise<ReadableStream> {
		const { dynamicArgs, tools, history } = cmd;
		const messages: ChatCompletionMessageParam[] = [
			...(history as ChatCompletionMessageParam[]),
			{
				role: 'system',
				content: `${DISCOVERY_PROMPT}`
			}
		];

		// Run tool loop first (not streamed)
		await this.runToolLoop(messages, dynamicArgs, [...tools, ...this.tools]);

		// Stream only the final response
		const res = await llm.chat.completions.create({
			model: AGENT_MODEL,
			messages,
			stream: true
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
	}

	private async runToolLoop(
		workflowMessages: ChatCompletionMessageParam[],
		dynamicArgs: Record<string, unknown>,
		tools: Tool[]
	): Promise<void> {
		for (let i = 0; i < MAX_LOOP_ITERATIONS; i++) {
			const res = await llm.chat.completions.create({
				model: AGENT_MODEL,
				messages: workflowMessages,
				stream: false,
				tools: tools.map((t) => t.schema),
				tool_choice: 'auto'
			});

			const message = res.choices[0].message;
			const openaiToolCalls = message.tool_calls;

			const toolCalls: ToolCall[] =
				openaiToolCalls
					?.filter((tc): tc is Extract<typeof tc, { function: unknown }> => 'function' in tc)
					.map((tc) => ({
						id: tc.id,
						name: tc.function.name,
						args: JSON.parse(tc.function.arguments || '{}')
					})) || [];

			// No tool calls = done with loop
			if (toolCalls.length === 0) {
				break;
			}

			// Add assistant message with tool calls
			workflowMessages.push({
				role: 'assistant',
				content: message.content || null,
				tool_calls: openaiToolCalls
			});

			// Execute tools and add results
			for (const toolCall of toolCalls) {
				const tool = tools.find((t) => t.schema.function.name === toolCall.name);
				if (!tool) throw new Error(`Unknown tool: ${toolCall.name}`);
				await tool.callback({ ...dynamicArgs, ...toolCall.args });
				workflowMessages.push({
					role: 'tool',
					tool_call_id: toolCall.id,
					content: `Tool ${toolCall.name} executed successfully`
				});
			}
		}
	}
}
