import type { DocumentMetadata } from '@mendable/firecrawl-js';
import type { SearchQueriesResponse } from '$lib/shared';

export type SearchResult = {
	id: string;
	title: string;
	description: string;
	url: string;
	markdown: string;
	links: string[];
	metadata: DocumentMetadata;
};

export interface SearchApp {
	generateQueries(painId: string, prompt: string): Promise<SearchQueriesResponse[]>;
	searchQueries(queryIds: string[]): Promise<SearchResult[][]>;
}
