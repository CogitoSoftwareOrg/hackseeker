import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';
import { grok, LLMS } from '$lib/shared/server';

import type { Planner, Tool, ToolCall } from '../../core';

const PLANNER_MODEL = LLMS.GROK_4_1_FAST;
const PLANNER_PROMPT = `
You are an expert planner.
Your goal is to analyze the conversation history and memory to determine if any tools need to be executed to fulfill the user's request.
You have access to specific tools for searching and saving memories.
If the user asks for information that might be in memory, use the search tool.
If the user provides important information that should be remembered, use the save tool.
If no tools are needed, return an empty list of tool calls.
Do not answer the user directly; your only output is the list of tool calls.
`;

export class ValidationPlanner implements Planner {
	constructor() {}

	async plan(history: OpenAIMessage[], memo: MemporyGetResult, tools: Tool[]): Promise<ToolCall[]> {
		const messages: OpenAIMessage[] = [];

		// 1. System Prompt
		messages.push({
			role: 'system',
			content: PLANNER_PROMPT
		});

		// 2. Memory Context (as System/Context)
		if (memo.static && memo.static.length > 0) {
			const parts = memo.static.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `Static memories:\n${parts}`
			});
		}

		// 3. Conversation History
		messages.push(...history);

		// 4. User Profile Memories and Event Memories
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

		const res = await grok.chat.completions.create({
			model: PLANNER_MODEL,
			messages: messages as ChatCompletionMessageParam[],
			stream: false,
			tools,
			tool_choice: 'auto'
		});

		const openaiToolCalls = res.choices[0].message.tool_calls;
		return (
			openaiToolCalls
				?.filter((toolCall): toolCall is Extract<typeof toolCall, { function: unknown }> => {
					return 'function' in toolCall;
				})
				.map((toolCall) => ({
					id: toolCall.id,
					name: toolCall.function.name,
					args: JSON.parse(toolCall.function.arguments || '{}')
				})) || []
		);
	}
}
