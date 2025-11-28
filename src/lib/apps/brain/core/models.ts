import { zodFunction } from 'openai/helpers/zod.js';

export type WorkflowMode = 'discovery' | 'validation';

export type ToolCall = {
	id: string;
	name: string;
	args: Record<string, unknown>;
};

export type Tool = ReturnType<typeof zodFunction>;
