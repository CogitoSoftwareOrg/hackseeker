import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';

export interface BrainRunCmd {
	profileId: string;
	chatId: string;
	history: OpenAIMessage[];
	memo: MemporyGetResult;
}

export interface BrainRunResult {
	response: string;
}

export interface BrainApp {
	run(cmd: BrainRunCmd): Promise<string>;
	runStream(cmd: BrainRunCmd): Promise<ReadableStream>;
}
