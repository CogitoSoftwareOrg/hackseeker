import { observe } from '@langfuse/tracing';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { llm, LLMS } from '$lib/shared/server';

import type { Agent, AgentRunCmd, Tool, ToolCall } from '$lib/shared/server';

const OBSERVATION_NAME = 'validation-agent-run';
const OBSERVATION_TYPE = 'agent';
const MAX_LOOP_ITERATIONS = 1;
const AGENT_MODEL = LLMS.GROK_4_1_REASONING;

export const VALIDATION_PROMPT = `
[HIGH-LEVEL ROLE AND PURPOSE]
You are a search query assistant for market validation research.
Your primary purpose is to help users find specific search queries to validate a business problem.

[IMPORTANT VIBE]
4 MOST COMMON MISTAKES:
   - Not Solving a Real Problem
   - Getting Stuck in a Tarpit Idea
   - Not Evaluating an Idea
   - Waiting for the Perfect Idea

10 KEY QUESTIONS TO ASK ABOUT A STARTUP:
   - Do you have Founder Market Fit? (pick a good idea for your team)
   - How big is the Market?
   - How accute is it problem? (does someone care about it?)
   - Do you have competition? (most good startup ideas have competition)
   - Do you want the product?
   - Did this recently become possible or necessary?
   - Are there good proxies for this business? (not a direct competitor)
   - Is this an idea you want to work for years? 
   - Is this an scalable business?
   - Is this a good idea space? (with good future hit rate)

3 THINGS THAT MAKE YOUR STARTUP IDEA GOOD (although they might seem bad):
   - Ideas that are hard to get started (hard ideas usually imply oportunities just sitting there to be taken)
   - Ideas that are in a boring space (boring ideas have a much higher hit rate than fun ideas)
   - Ideas that have market competitors (specially good if they suck)

HOW TO COME UP WITH STARTUP IDEAS:
   - Become an expert on something valuable
   - Work at a startup
   - Build things you find interesting

7 RECIPES FOR GENERATING STARTUP IDEAS:
   - Start with what your team is good at (authomatic Founder Market Fit)

   - Start with a problem you personally have encountered
          --> Look into your life and professional experiences for startup ideas
   - Think of things you personally wish existed (careful with tarpit ideas)

   - Look for things in the world that have changed recently

   - Look for new variants of successful companies

   - Talk to people and ask them what problems they have (potentially in fertile ideas spaces)

   - Look for big industries that look broken

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

	run = observe(
		async (cmd: AgentRunCmd): Promise<string> => {
			const { dynamicArgs, history, tools, knowledge } = cmd;
			const messages = this.buildMessages(history as ChatCompletionMessageParam[], knowledge);

			const result = await this.runToolLoop(messages, dynamicArgs, [...tools, ...this.tools]);
			if (result) return result;

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
			const { dynamicArgs, history, tools, knowledge } = cmd;
			const messages = this.buildMessages(history as ChatCompletionMessageParam[], knowledge);

			// Run tool loop first (not streamed)
			const result = await this.runToolLoop(messages, dynamicArgs, [...tools, ...this.tools]);
			if (result) {
				return new ReadableStream({
					async start(controller) {
						controller.enqueue(result);
						controller.close();
					}
				});
			}

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
		},
		{
			name: OBSERVATION_NAME,
			asType: OBSERVATION_TYPE
		}
	);

	private async runToolLoop(
		workflowMessages: ChatCompletionMessageParam[],
		dynamicArgs: Record<string, unknown>,
		tools: Tool[]
	): Promise<string> {
		let result = '';
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
				result = message.content || '';
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

		return result;
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
