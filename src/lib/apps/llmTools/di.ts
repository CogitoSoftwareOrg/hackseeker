import { LlmToolsAppImpl } from './app';
import type { LlmToolsApp } from './core';

export const getLlmToolsApp = (): LlmToolsApp => {
	return new LlmToolsAppImpl('llm-tools');
};
