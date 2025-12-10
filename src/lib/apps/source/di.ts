import type { SourceApp } from './core';
import { SourceAppImpl } from './app';
import { MeiliChunksIndexer, Crawl4aiCrawler, LlamaNormilizer } from './adapters';

export const getSourceApp = (): SourceApp => {
	const normalizer = new LlamaNormilizer();
	const chunksIndexer = new MeiliChunksIndexer();
	const crawler = new Crawl4aiCrawler();

	chunksIndexer.migrate().then(() => {
		console.log('Chunks indexers migrated');
	});

	return new SourceAppImpl(normalizer, chunksIndexer, crawler);
};
