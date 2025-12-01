import type { ChatEventMemory } from './models';

export interface ChatEventIndexer {
	add(memory: ChatEventMemory[]): Promise<void>;
	search(query: string, tokens: number, chatId: string): Promise<ChatEventMemory[]>;
}
