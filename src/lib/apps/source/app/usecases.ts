import {
	Collections,
	pb,
	SourcesStatusOptions,
	type ChunksResponse,
	type SourcesResponse
} from '$lib/shared';

import type {
	Normalizer,
	AddSourceCmd,
	SourceApp,
	RemoveSourceCmd,
	SearchChunksCmd,
	ChunksIndexer,
	Crawler
} from '../core';

export class SourceAppImpl implements SourceApp {
	constructor(
		private readonly normalizer: Normalizer,
		private readonly chunksIndexer: ChunksIndexer,
		private readonly crawler: Crawler
	) {}

	async addSource(cmd: AddSourceCmd) {
		let file = cmd.file;

		if (cmd.mode === 'url') {
			if (!cmd.url) throw new Error('URL is required');
			const results = await this.crawler.crawl([cmd.url]);
			const md = results[0].markdown;
			file = new File([md], 'source.md', { type: 'text/markdown' });
		}

		const source = await pb.collection(Collections.Sources).create({
			user: cmd.userId,
			file,
			title: cmd.title,
			url: cmd.url,
			status: SourcesStatusOptions.loaded,
			metadata: cmd.metadata
		});

		if (!file) throw new Error('File is required');

		// Process in background (fire and forget)
		this.processSource(source, file, cmd.userId).catch((error) => {
			console.error('Failed to process source:', error);
		});
	}

	private async processSource(source: SourcesResponse, file: File, userId: string): Promise<void> {
		try {
			const chunks = await this.normalizer.normalize(source, file);
			await pb.collection(Collections.Sources).update(source.id, {
				status: SourcesStatusOptions.normalized
			});

			await this.chunksIndexer.add(chunks, userId);
			await pb.collection(Collections.Sources).update(source.id, {
				status: SourcesStatusOptions.indexed
			});
		} catch (error) {
			await pb.collection(Collections.Sources).update(source.id, {
				status: SourcesStatusOptions.error
			});
			console.error('Source processing failed:', error);
		}
	}

	async removeSource(cmd: RemoveSourceCmd): Promise<void> {
		await pb.collection(Collections.Sources).delete(cmd.sourceId);
	}

	async searchChunks(cmd: SearchChunksCmd): Promise<ChunksResponse[]> {
		return this.chunksIndexer.search(cmd.query, cmd.tokens, cmd.sourceIds, cmd.userId);
	}
}
