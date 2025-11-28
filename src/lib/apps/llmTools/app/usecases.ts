import type { LlmToolsApp } from '../core';

export class LlmToolsAppImpl implements LlmToolsApp {
	constructor(public readonly name: string) {}
}
