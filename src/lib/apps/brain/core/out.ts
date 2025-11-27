import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';

export type AgentRunCmd = {
	profileId: string;
	chatId: string;
	history: OpenAIMessage[];
	memo: MemporyGetResult;
};

export type AgentResult = {
	history: OpenAIMessage[];
	memo: MemporyGetResult;
};

export interface Agent {
	run(cmd: AgentRunCmd): Promise<AgentResult>;
	runStream(cmd: AgentRunCmd): Promise<ReadableStream>;
}

export interface Synthesizer {
	synthesize(history: OpenAIMessage[], memo: MemporyGetResult): Promise<string>;
	synthesizeStream(history: OpenAIMessage[], memo: MemporyGetResult): Promise<ReadableStream>;
}
