import { zodFunction } from 'openai/helpers/zod.js';

export type ToolCall = {
	id: string;
	name: string;
	args: Record<string, unknown>;
};

export type Tool = {
	schema: ReturnType<typeof zodFunction>;
	callback: (args: Record<string, unknown>) => Promise<unknown>;
};
