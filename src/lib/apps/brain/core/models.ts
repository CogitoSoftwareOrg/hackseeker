import { zodFunction } from 'openai/helpers/zod.js';

export type WorkflowMode = 'discovery' | 'validation';

export type ToolCall = {
	id: string;
	name: string;
	args: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Tool = ReturnType<typeof zodFunction>;
