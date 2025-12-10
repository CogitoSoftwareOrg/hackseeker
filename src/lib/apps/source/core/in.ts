import type { ChunksResponse } from '$lib';

export type AddSourceCmd = {
	userId: string;
	mode: 'file' | 'url';
	file?: File;
	title?: string;
	url?: string;
	metadata?: Record<string, unknown>;
};

export type RemoveSourceCmd = {
	userId: string;
	sourceId: string;
};

export type SearchChunksCmd = {
	userId: string;
	sourceIds: string[];
	tokens: number;
	query: string;
};

export interface SourceApp {
	addSource(cmd: AddSourceCmd): Promise<void>;
	removeSource(cmd: RemoveSourceCmd): Promise<void>;

	searchChunks(cmd: SearchChunksCmd): Promise<ChunksResponse[]>;
}
