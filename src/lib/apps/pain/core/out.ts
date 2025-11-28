import type { MemporyGetResult } from '$lib/apps/memory/core';
import type { Tool } from '$lib/apps/llmTools/core';
import type { OpenAIMessage } from '$lib/apps/chat/core';

export type AgentRunCmd = {
	tools: Tool[];
	history: OpenAIMessage[];
	memo: MemporyGetResult;
	dynamicArgs: Record<string, unknown>;
};

export interface Agent {
	tools: Tool[];

	run(cmd: AgentRunCmd): Promise<string>;
	runStream(cmd: AgentRunCmd): Promise<ReadableStream>;
}

export interface Renderer {
	render(content: string): Promise<Blob>;
}
