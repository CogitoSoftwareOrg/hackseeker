import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';
import { grok, LLMS } from '$lib/shared/server';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import type { Agent, Tool, ToolCall } from '../../core';

const AGENT_PROMPT = `
You are a helpful assistant.
You are given a history of messages and a memory.
You need to use the available tools to achieve the user goal.
`;

const MAX_LOOP_AMOUNT = 3;

export class SimpleAgent implements Agent {
	constructor() {}

	async run(history: OpenAIMessage[], memo: MemporyGetResult, tools: Tool[]): Promise<string> {
		// const res = await grok.chat.completions.create({
		// 	model: LLMS.GROK_4_1_FAST,
		// 	messages: messages,
		// 	stream: false,
		// 	tools,
		// 	tool_choice: 'auto'
		// });

		// const openaiToolCalls = res.choices[0].message.tool_calls;
		// return res.choices[0].message.content || '';
		console.log(history, memo, tools);
		return '';
	}

	async runStream(
		history: OpenAIMessage[],
		memo: MemporyGetResult,
		tools: Tool[]
	): Promise<ReadableStream> {
		const encoder = new TextEncoder();
		const initialMessages = await this.prepare(history, memo);

		return new ReadableStream({
			async start(controller) {
				try {
					let stepTools = tools;
					// Используем более широкий тип для работы со стримами OpenAI
					const workflowMessages: ChatCompletionMessageParam[] = [...initialMessages];

					for (let i = 0; i < MAX_LOOP_AMOUNT; i++) {
						if (i === MAX_LOOP_AMOUNT - 1) stepTools = [];

						// Открываем новый стрим к OpenAI
						const stream = await grok.chat.completions.create({
							model: LLMS.GROK_4_1_FAST,
							messages: workflowMessages,
							stream: true,
							tools: stepTools.length > 0 ? stepTools : undefined,
							tool_choice: stepTools.length > 0 ? 'auto' : undefined,
							stream_options: { include_usage: true }
						});

						let accumulatedContent = '';
						const toolCalls: ToolCall[] = [];

						// Читаем из стрима и передаем данные наружу
						for await (const chunk of stream) {
							if (chunk.choices && chunk.choices.length > 0) {
								const choice = chunk.choices[0];
								const delta = choice.delta;

								// Обрабатываем текстовый контент
								if (delta?.content) {
									accumulatedContent += delta.content;
									controller.enqueue(encoder.encode(delta.content));
								}

								// Собираем tool calls
								if (delta?.tool_calls) {
									for (const toolCall of delta.tool_calls) {
										const index = toolCall.index ?? 0;
										if (!toolCalls[index]) {
											toolCalls[index] = {
												id: toolCall.id || '',
												name: toolCall.function?.name || '',
												args: JSON.parse(toolCall.function?.arguments || '{}')
											};
										} else {
											toolCalls[index].args = {
												...toolCalls[index].args,
												...JSON.parse(toolCall.function?.arguments || '{}')
											};
										}
									}
								}
							}
						}

						// Если есть tool calls, обрабатываем их и продолжаем цикл
						if (toolCalls.length > 0 && i < MAX_LOOP_AMOUNT - 1) {
							// Добавляем ответ ассистента с tool calls в историю
							workflowMessages.push({
								role: 'assistant',
								content: accumulatedContent || null,
								tool_calls: toolCalls.map((tc) => ({
									id: tc.id,
									type: 'function',
									function: {
										name: tc.name,
										arguments: tc.args ? JSON.stringify(tc.args) : '{}'
									}
								}))
							});

							// Здесь должна быть логика выполнения tool calls
							// Пока что просто добавляем результаты в историю
							for (const toolCall of toolCalls) {
								workflowMessages.push({
									role: 'tool',
									tool_call_id: toolCall.id,
									content: JSON.stringify({ result: 'Tool executed' }) // Заменить на реальный результат
								});
							}

							// Продолжаем цикл для следующего запроса
							continue;
						}

						// Если нет tool calls или это последняя итерация - завершаем
						break;
					}
				} catch (error) {
					controller.error(error);
				} finally {
					controller.close();
				}
			}
		});
	}

	private async prepare(
		history: OpenAIMessage[],
		memo: MemporyGetResult
	): Promise<OpenAIMessage[]> {
		const messages: OpenAIMessage[] = [];

		if (memo.static) {
			messages.push({
				role: 'system',
				content: `Static memories`
			});
			const parts = memo.static
				.map((part) => {
					return `- ${part.content}`;
				})
				.join('\n');
			messages.push({
				role: 'user',
				content: parts
			});
		}

		messages.push({
			role: 'system',
			content: AGENT_PROMPT
		});
		messages.push(...history);

		if (memo.profile) {
			messages.push({
				role: 'system',
				content: `User prfile memories`
			});
			const parts = memo.profile
				.map((part) => {
					return `- ${part.content}`;
				})
				.join('\n');
			messages.push({
				role: 'user',
				content: parts
			});
		}

		if (memo.event) {
			messages.push({
				role: 'system',
				content: `Chat event memories`
			});
			const parts = memo.event
				.map((part) => {
					return `- ${part.content}`;
				})
				.join('\n');
			messages.push({
				role: 'user',
				content: parts
			});
		}

		return messages;
	}
}
