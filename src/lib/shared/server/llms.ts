import { encoding_for_model } from 'tiktoken';
import { zodFunction } from 'openai/helpers/zod.js';
import { env } from '$env/dynamic/private';
import { observeOpenAI } from '@langfuse/openai';
import OpenAI from 'openai';

import type { OpenAIMessage } from '$lib/apps/chat/core';

// LLMS
export const LLMS = {
	// OpenAI

	// Grok
	GROK_4_1_NON_REASONING: 'xai/grok-4-1-fast-non-reasoning',
	GROK_4_1_REASONING: 'xai/grok-4-1-fast-reasoning',

	// Voyage
	VOYAGE_3_5_LITE: 'voyage/voyage-3.5-lite'
} as const;

// CLIENT
export const llm = observeOpenAI(
	new OpenAI({
		baseURL: env.LITELLM_URL,
		apiKey: env.LITELLM_API_KEY
	})
);

// TOKENIZERS
const tokenizer = encoding_for_model('gpt-4o-mini');
export const countTokens = (text: string) => {
	return tokenizer.encode(text).length;
};

export const voyageEmbed = async (
	input: string[],
	batchSize: number = 128,
	dimensions: number = 1024
) => {
	const embedTasks = [];
	for (let i = 0; i < input.length; i += batchSize) {
		const batch = input.slice(i, i + batchSize);
		embedTasks.push(
			llm.embeddings.create({
				input: batch,
				model: LLMS.VOYAGE_3_5_LITE,
				dimensions
			})
		);
	}
	const embeddings = (await Promise.all(embedTasks))
		.flatMap((res) => res.data)
		.map((res) => res?.embedding);
	return embeddings;
};

// TYPES
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
