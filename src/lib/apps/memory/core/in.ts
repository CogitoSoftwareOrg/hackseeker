import type { Tool } from '$lib/apps/brain/core';

import type {
	EventMemory,
	EventType,
	ProfileType,
	StaticMemory,
	ProfileMemory,
	Importance
} from './models';

export type MemoryGetCmd = {
	query: string;
	tokens: number;
	profileId: string;
	chatId: string;
};
export type MemporyGetResult = {
	static: StaticMemory[];
	event: EventMemory[];
	profile: ProfileMemory[];
};

export type MemoryProfilePutDto = {
	profileId: string;
	content: string;
	type: ProfileType;
	importance: Importance;
};
export type MemoryEventPutDto = {
	chatId: string;
	content: string;
	type: EventType;
	importance: Importance;
};
export type MemoryPutCmd = {
	profiles: MemoryProfilePutDto[];
	events: MemoryEventPutDto[];
};

export interface MemoryApp {
	searchTool: Tool;
	putTool: Tool;

	get(cmd: MemoryGetCmd): Promise<MemporyGetResult>;
	put(cmd: MemoryPutCmd): Promise<void>;
}
