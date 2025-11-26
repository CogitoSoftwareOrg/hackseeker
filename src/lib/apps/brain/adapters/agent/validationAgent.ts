import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import type { OpenAIMessage } from '$lib/apps/chat/core';
import type {
	EventType,
	Importance,
	MemoryApp,
	MemoryGetCmd,
	MemoryPutCmd,
	MemporyGetResult,
	ProfileType
} from '$lib/apps/memory/core';
import type { PainApp, PainUpdateCmd } from '$lib/apps/pain/core';
import { grok, LLMS } from '$lib/shared/server';

import type { Agent, AgentResult, AgentRunCmd } from '../../core';
import type { Tool, ToolCall } from '../../core/models';

import { VALIDATION_PLANNER_PROMPT } from './prompts';

const AGENT_MODEL = LLMS.GROK_4_1_FAST;
const MAX_LOOP_ITERATIONS = 5;
const ADDITIONAL_MEMORY_TOKENS = 1000;

export class ValidationAgent implements Agent {
	private readonly tools: Tool[];

	constructor(
		private readonly memoryApp: MemoryApp,
		private readonly painApp: PainApp
	) {
		// Validation mode doesn't have createTool - only update existing pains
		this.tools = [this.memoryApp.searchTool, this.memoryApp.putTool, this.painApp.updateTool];
	}

	async run(cmd: AgentRunCmd): Promise<AgentResult> {
		const { profileId, chatId, memo } = cmd;
		const history = [...cmd.history];

		const workflowMessages = this.prepareMessages(history, memo);

		for (let i = 0; i < MAX_LOOP_ITERATIONS; i++) {
			const isLastIteration = i === MAX_LOOP_ITERATIONS - 1;
			const currentTools = isLastIteration ? [] : this.tools;

			console.log(`ValidationAgent iteration ${i + 1}/${MAX_LOOP_ITERATIONS}`);

			const res = await grok.chat.completions.create({
				model: AGENT_MODEL,
				messages: workflowMessages as ChatCompletionMessageParam[],
				stream: false,
				tools: currentTools.length > 0 ? currentTools : undefined,
				tool_choice: currentTools.length > 0 ? 'auto' : undefined
			});

			const message = res.choices[0].message;
			const content = message.content || '';
			const openaiToolCalls = message.tool_calls;

			// Parse tool calls
			const toolCalls: ToolCall[] =
				openaiToolCalls
					?.filter((tc): tc is Extract<typeof tc, { function: unknown }> => 'function' in tc)
					.map((tc) => ({
						id: tc.id,
						name: tc.function.name,
						args: JSON.parse(tc.function.arguments || '{}')
					})) || [];

			console.log(`ValidationAgent got ${toolCalls.length} tool calls`);

			// If no tool calls, we're done - add final response to history
			if (toolCalls.length === 0) {
				history.push({
					role: 'assistant',
					content
				});
				break;
			}

			// Add assistant message with tool calls to workflow
			workflowMessages.push({
				role: 'assistant',
				content: content || null,
				tool_calls: openaiToolCalls
			});

			// Execute each tool call
			for (const toolCall of toolCalls) {
				const result = await this.executeTool(toolCall, profileId, chatId, memo);

				workflowMessages.push({
					role: 'tool',
					tool_call_id: toolCall.id,
					content: result
				});
			}

			// Also add to history for context
			history.push({
				role: 'assistant',
				content: '',
				tool_calls: toolCalls.map((tc) => ({
					id: tc.id,
					type: 'function' as const,
					function: {
						name: tc.name,
						arguments: JSON.stringify(tc.args)
					}
				}))
			});

			for (const toolCall of toolCalls) {
				history.push({
					role: 'tool',
					tool_call_id: toolCall.id,
					content: 'Tool executed'
				});
			}
		}

		return { history, memo };
	}

	private prepareMessages(
		history: OpenAIMessage[],
		memo: MemporyGetResult
	): ChatCompletionMessageParam[] {
		const messages: ChatCompletionMessageParam[] = [];

		// 1. System prompt with static memories context
		const staticParts = memo.static.map((part) => `- ${part.content}`).join('\n');
		messages.push({
			role: 'system',
			content: `${VALIDATION_PLANNER_PROMPT}\n\nPain Being Validated:\n${staticParts || 'No pain selected for validation.'}`
		});

		// 2. Profile memories
		if (memo.profile && memo.profile.length > 0) {
			const parts = memo.profile.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `User profile memories:\n${parts}`
			});
		}

		// 3. Event memories
		if (memo.event && memo.event.length > 0) {
			const parts = memo.event.map((part) => `- ${part.content}`).join('\n');
			messages.push({
				role: 'system',
				content: `Chat event memories:\n${parts}`
			});
		}

		// 4. Conversation history
		messages.push(...(history as ChatCompletionMessageParam[]));

		return messages;
	}

	private async executeTool(
		toolCall: ToolCall,
		profileId: string,
		chatId: string,
		memo: MemporyGetResult
	): Promise<string> {
		console.log(`Executing tool: ${toolCall.name}`);

		if (toolCall.name === this.memoryApp.searchTool.function.name) {
			console.log(`Memory search tool called with query: ${toolCall.args.query}`);

			const dto: MemoryGetCmd = {
				query: toolCall.args.query as string,
				tokens: ADDITIONAL_MEMORY_TOKENS,
				profileId,
				chatId
			};
			const result = await this.memoryApp.get(dto);

			console.log(
				`Memory search result: ${result.event?.length || 0} events, ${result.profile?.length || 0} profiles`
			);

			// Append new memories to memo (mutating)
			if (result.event && result.event.length > 0) {
				memo.event.push(...result.event);
			}
			if (result.profile && result.profile.length > 0) {
				memo.profile.push(...result.profile);
			}

			return 'Memory searched successfully!';
		}

		if (toolCall.name === this.memoryApp.putTool.function.name) {
			console.log(`Memory put tool called`);

			const dto: MemoryPutCmd = {
				profiles: (
					toolCall.args.profiles as {
						type: ProfileType;
						importance: Importance;
						content: string;
					}[]
				).map((profile) => ({
					profileId,
					...profile
				})),
				events: (
					toolCall.args.events as { type: EventType; importance: Importance; content: string }[]
				).map((event) => ({
					chatId,
					...event
				}))
			};
			await this.memoryApp.put(dto);

			return 'Memory saved successfully!';
		}

		if (toolCall.name === this.painApp.updateTool.function.name) {
			console.log(`Pain update tool called with: ${JSON.stringify(toolCall.args)}`);

			const dto: PainUpdateCmd = {
				id: toolCall.args.id as string,
				...toolCall.args
			};
			await this.painApp.update(dto);

			return 'Pain draft updated successfully!';
		}

		return `Unknown tool: ${toolCall.name}`;
	}
}
