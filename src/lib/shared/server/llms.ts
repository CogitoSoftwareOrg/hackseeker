import { encoding_for_model } from 'tiktoken';
import { zodFunction } from 'openai/helpers/zod.js';

import type { OpenAIMessage } from '$lib/apps/chat/core';

export const LLMS = {
	// OpenAI
	GPT_5_NANO: 'gpt-5-nano',
	GPT_5_MINI: 'gpt-5-mini',
	GPT_5_1: 'gpt-5.1',

	// Grok
	GROK_4_FAST_NON_REASONING: 'grok-4-fast-non-reasoning',
	GROK_4_FAST: 'grok-4-fast',
	GROK_4_1_FAST: 'grok-4-1-fast-reasoning',
	GROK_4_1_FAST_NON_REASONING: 'grok-4-1-fast-non-reasoning'
} as const;

export const TOKENIZERS = {
	[LLMS.GROK_4_FAST_NON_REASONING]: encoding_for_model('gpt-4o-mini'),
	[LLMS.GROK_4_FAST]: encoding_for_model('gpt-4o-mini')
};

export const EMBEDDERS = {
	VOYAGE_LITE: 'voyage-3.5-lite'
};

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
	tools: Tool[];
	history: OpenAIMessage[];
	knowledge: string;
	dynamicArgs: Record<string, unknown>;
};

export interface Agent {
	tools: Tool[];

	run(cmd: AgentRunCmd): Promise<string>;
	runStream(cmd: AgentRunCmd): Promise<ReadableStream>;
}
