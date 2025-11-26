import type { EventMemory, EventType, ProfileMemory } from './models';

export interface ProfileIndexer {
	add(memory: ProfileMemory[]): Promise<void>;
	search(query: string, tokens: number, userId: string): Promise<ProfileMemory[]>;
}
export interface EventIndexer {
	add(memory: EventMemory[]): Promise<void>;
	search(
		query: string,
		tokens: number,
		chatId: string,
		days?: number,
		type?: EventType
	): Promise<EventMemory[]>;
}
