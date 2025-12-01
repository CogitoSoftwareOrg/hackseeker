import type { UserMemory } from './models';

export interface UserIndexer {
	add(memory: UserMemory[]): Promise<void>;
	search(query: string, tokens: number, userId: string): Promise<UserMemory[]>;
}
