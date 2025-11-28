import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemoryApp, MemporyGetResult } from '$lib/apps/memory/core';
import type { PainCreateCmd, PainUpdateCmd } from '$lib/apps/pain/core';
import { grok, LLMS } from '$lib/shared/server';

import type { Agent, AgentResult, AgentRunCmd, Tool, ToolCall } from '$lib/apps/llmTools/core';

import { createPainTool, updatePainTool } from '../tools';
import { DISCOVERY_PROMPT } from './prompts';

const AGENT_MODEL = LLMS.GROK_4_1_FAST;
const MAX_LOOP_ITERATIONS = 5;

export class DiscoveryAgent implements Agent {
	tools: Tool[];

	constructor(memoryApp: MemoryApp, tools: Tool[]) {
		this.tools = [memoryApp.searchTool, memoryApp.putTool, ...tools];
	}

	async run(cmd: AgentRunCmd): Promise<AgentResult> {
		const { userId, chatId, tools, memo } = cmd;
		const history = [...cmd.history];
		const workflowMessages = this.prepareMessages(history, memo);

		// Run tool loop
		await this.runToolLoop(workflowMessages, userId, chatId, [...tools, ...this.tools]);

		// Final response (no tools)
		const res = await grok.chat.completions.create({
			model: AGENT_MODEL,
			messages: workflowMessages as ChatCompletionMessageParam[],
			stream: false
		});

		const content = res.choices[0].message.content || '';
		history.push({ role: 'assistant', content });

		return { history, memo };
	}

	async runStream(cmd: AgentRunCmd): Promise<ReadableStream> {
		const { userId, chatId, tools, memo } = cmd;
		const workflowMessages = this.prepareMessages([...cmd.history], memo);

		// Run tool loop first (not streamed)
		await this.runToolLoop(workflowMessages, userId, chatId, [...tools, ...this.tools]);

		// Stream only the final response
		const res = await grok.chat.completions.create({
			model: AGENT_MODEL,
			messages: workflowMessages as ChatCompletionMessageParam[],
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
		userId: string,
		chatId: string,
		tools: Tool[]
	): Promise<void> {
		for (let i = 0; i < MAX_LOOP_ITERATIONS; i++) {
			const res = await grok.chat.completions.create({
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
				const result = await this.executeTool(toolCall, userId, chatId, tool);
				workflowMessages.push({
					role: 'tool',
					tool_call_id: toolCall.id,
					content: result
				});
			}
		}
	}

	private prepareMessages(
		history: OpenAIMessage[],
		memo: MemporyGetResult
	): ChatCompletionMessageParam[] {
		const messages: ChatCompletionMessageParam[] = [];
		const staticParts = memo.static.map((part) => `- ${part.content}`).join('\n');
		messages.push({
			role: 'system',
			content: `${DISCOVERY_PROMPT}\n\nContext:\n${staticParts || 'No drafts yet.'}`
		});

		if (memo.profile && memo.profile.length > 0) {
			const parts = memo.profile.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `User context:\n${parts}`
			});
		}

		if (memo.event && memo.event.length > 0) {
			const parts = memo.event.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `Chat context:\n${parts}`
			});
		}

		messages.push(...(history as ChatCompletionMessageParam[]));

		return messages;
	}

	private async executeTool(
		toolCall: ToolCall,
		userId: string,
		chatId: string,
		tool: Tool
	): Promise<string> {
		if (tool.schema.function.name === createPainTool.function.name) {
			const dto: PainCreateCmd = {
				chatId,
				userId,
				segment: toolCall.args.segment as string,
				problem: toolCall.args.problem as string,
				jtbd: toolCall.args.jtbd as string,
				keywords: toolCall.args.keywords as string[]
			};
			await tool.callback(dto);
			return 'Draft created';
		}

		if (toolCall.name === updatePainTool.function.name) {
			const dto: PainUpdateCmd = {
				id: toolCall.args.id as string,
				...toolCall.args
			};
			await tool.callback(dto);
			return 'Draft updated';
		}

		return `Unknown tool: ${toolCall.name}`;
	}
}
