import type { SearchData, SearchResultWeb } from '@mendable/firecrawl-js';

import { firecrawl } from '$lib/shared/server';
import { Collections, pb, type SearchQueriesResponse } from '$lib/shared';

import type { SearchApp, SearchResult, QueryGenerator } from '../core';

const SEARCH_LIMIT = 2;

export class SearchAppImpl implements SearchApp {
	constructor(private readonly queryGenerator: QueryGenerator) {}

	async generateQueries(painId: string, prompt: string): Promise<SearchQueriesResponse[]> {
		const res = await this.queryGenerator.generate(prompt);
		const searchQueries = await Promise.all(
			res.queries.map(async (query) => {
				return await pb.collection(Collections.SearchQueries).create({
					pain: painId,
					query: query.query,
					type: query.type
				});
			})
		);
		return searchQueries;
	}

	async searchQueries(queries: SearchQueriesResponse[]): Promise<SearchResult[][]> {
		const results = await Promise.all(
			queries.map(async (q) => {
				const res = await this.searchQuery(q.id, q.query);
				const web = res.web;
				return (
					web
						?.map((doc) => doc as SearchResultWeb)
						.map((doc) => ({
							id: q.id,
							title: doc.title ?? '',
							description: doc.description ?? '',
							url: doc.url ?? '',
							// @ts-expect-error - firecrawl types are not correct
							markdown: doc.markdown ?? '',
							// @ts-expect-error - firecrawl types are not correct
							links: doc.links ?? [],
							// @ts-expect-error - firecrawl types are not correct
							metadata: doc.metadata ?? {}
						})) ?? []
				);
			})
		);

		return results;
	}

	async searchQuery(id: string, query: string, limit?: number): Promise<SearchData> {
		const res = await firecrawl.search(query, {
			limit: limit ?? SEARCH_LIMIT,
			scrapeOptions: { formats: ['markdown'] }
		});
		await pb.collection(Collections.SearchQueries).update(id, { offset: limit ?? SEARCH_LIMIT });

		return res;
	}
}
