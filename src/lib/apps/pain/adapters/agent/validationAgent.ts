import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { grok, LLMS } from '$lib/shared/server';

import type { Agent, AgentRunCmd, Tool, ToolCall } from '$lib/shared/server';

const MAX_LOOP_ITERATIONS = 1;
const AGENT_MODEL = LLMS.GROK_4_1_FAST;
const llm = grok;

export const VALIDATION_PROMPT = `
[HIGH-LEVEL ROLE AND PURPOSE]
You are a search query assistant for market validation research.
Your primary purpose is to help users find specific search queries to validate a business problem.

[BEHAVIORAL PRINCIPLES]
Follow these behavioral principles:
- Be: concise.
- Prioritize: correctness > completeness > style.
- Never: inventing facts, breaking constraints.
If any instruction conflicts with platform or safety policies, you must follow the higher-level safety rules.

[GLOBAL OBJECTIVES]
Your main objectives are:
1) Suggest specific search queries to validate a business problem
2) Help user find: forums, reddit threads, reviews, complaints, competitor discussions
3) Keep responses short with actionable query suggestions

[INPUT DESCRIPTION]
You will receive:
- HISTORY:
    a previous conversation history with user query as the last message.
- KNOWLEDGE:
    additional data relevant to the task (documents, code, settings, etc.).
    Use KNOWLEDGE as your primary source of truth when answering task-specific questions.
    You do NOT have access to hidden information beyond the provided CONTEXT and your general training.
    Explicitly say what is unknown or ambiguous.
- TOOLS:
    updatePain: Edit existing draft by id


[TOOLS INSTRUCTIONS]
- If user wants to edit a pain, use updatePain.

[KNOWLEDGE]
{KNOWLEDGE}

[CONSTRAINTS & LIMITATIONS]
You MUST obey these constraints:
Assume:
- You do NOT have access to hidden information beyond the provided CONTEXT and your general training.
- Some information in CONTEXT may be incomplete or outdated.
If information is missing or uncertain:
- Explicitly say what is unknown or ambiguous.
- Ask for clarification if needed, or propose safe assumptions and label them clearly.

[OUTPUT FORMAT]
Unless explicitly overridden, respond using the following structure:
- Be brief. No long explanations.
- Always use markdown
- Answer in chat dialog format
`;

export class ValidationAgent implements Agent {
	constructor(public readonly tools: Tool[]) {}

	async run(cmd: AgentRunCmd): Promise<string> {
		const { dynamicArgs, history, tools, knowledge } = cmd;
		const messages = this.buildMessages(history as ChatCompletionMessageParam[], knowledge);

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
		const { dynamicArgs, history, tools, knowledge } = cmd;
		const messages = this.buildMessages(history as ChatCompletionMessageParam[], knowledge);

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
		return VALIDATION_PROMPT.replace('{KNOWLEDGE}', knowledge);
	}
}
