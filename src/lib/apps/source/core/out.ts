import type { ChunksResponse, SourcesResponse } from '$lib/shared';

export interface Normalizer {
	normalize(source: SourcesResponse, file: File): Promise<ChunksResponse[]>;
}

export interface ChunksIndexer {
	add(chunks: ChunksResponse[], userId: string): Promise<void>;
	search(
		query: string,
		tokens: number,
		sourceIds: string[],
		userId: string
	): Promise<ChunksResponse[]>;
	remove(userId: string, sourceIds: string[]): Promise<void>;
}

export type CrawlResult = {
	url: string;
	markdown: string;
	html: string;
	metadata: Record<string, unknown>;
};

export interface Crawler {
	crawl(urls: string[]): Promise<CrawlResult[]>;
}
