import { zodFunction } from 'openai/helpers/zod.js';

import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';

export type ToolCall = {
	id: string;
	name: string;
	args: Record<string, unknown>;
};

export type Tool = {
	schema: ReturnType<typeof zodFunction>;
	callback: (args: Record<string, unknown>) => Promise<unknown>;
};

export type AgentRunCmd = {
	userId: string;
	chatId: string;
	tools: Tool[];
	history: OpenAIMessage[];
	memo: MemporyGetResult;
};

export type AgentResult = {
	history: OpenAIMessage[];
	memo: MemporyGetResult;
};

export interface Agent {
	tools: Tool[];

	run(cmd: AgentRunCmd): Promise<AgentResult>;
	runStream(cmd: AgentRunCmd): Promise<ReadableStream>;
}

export interface Synthesizer {
	synthesize(history: OpenAIMessage[], memo: MemporyGetResult): Promise<string>;
	synthesizeStream(history: OpenAIMessage[], memo: MemporyGetResult): Promise<ReadableStream>;
}
