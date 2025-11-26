import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';

import type { ToolCall, Tool, WorkflowMode } from './models';

// export interface Agent {
// 	run(history: OpenAIMessage[], memo: MemporyGetResult, tools: Tool[]): Promise<string>;
// 	runStream(
// 		history: OpenAIMessage[],
// 		memo: MemporyGetResult,
// 		tools: Tool[]
// 	): Promise<ReadableStream>;
// }

export interface Planner {
	plan(
		history: OpenAIMessage[],
		memo: MemporyGetResult,
		tools: Tool[],
		mode: WorkflowMode
	): Promise<ToolCall[]>;
}

export interface Synthesizer {
	synthesize(history: OpenAIMessage[], memo: MemporyGetResult): Promise<string>;
	synthesizeStream(history: OpenAIMessage[], memo: MemporyGetResult): Promise<ReadableStream>;
}
