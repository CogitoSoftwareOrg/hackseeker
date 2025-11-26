import type { OpenAIMessage } from '$lib/apps/chat/core';
import type { MemporyGetResult } from '$lib/apps/memory/core';

import type { WorkflowMode } from './models';

export interface BrainRunCmd {
	mode: WorkflowMode;
	profileId: string;
	chatId: string;
	history: OpenAIMessage[];
	memo: MemporyGetResult;
}

export interface BrainApp {
	run(cmd: BrainRunCmd): Promise<string>;
	runStream(cmd: BrainRunCmd): Promise<ReadableStream>;
}
