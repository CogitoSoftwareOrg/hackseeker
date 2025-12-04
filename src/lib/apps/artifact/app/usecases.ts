import type z from 'zod';

import { Collections, pb } from '$lib';
import type { SearchApp, SearchResult } from '$lib/apps/search/core';

import {
	Artifact,
	ExtractorResultSchema,
	type ArtifactApp,
	type ArtifactExtractCmd,
	type ArtifactGetMemoriesCmd,
	type ArtifactIndexer,
	type ArtifactSearchCmd,
	type Extractor
} from '../core';

export class ArtifactAppImpl implements ArtifactApp {
	constructor(
		// ADAPTERS
		private readonly extractor: Extractor,
		private readonly artifactIndexer: ArtifactIndexer,

		// APPS
		private readonly searchApp: SearchApp
	) {}

	async getMemories(cmd: ArtifactGetMemoriesCmd): Promise<Artifact[]> {
		const artifacts = await this.artifactIndexer.search(
			cmd.userId,
			cmd.query,
			cmd.tokens,
			cmd.painId
		);
		return artifacts;
	}

	async search(cmd: ArtifactSearchCmd): Promise<Artifact[]> {
		const results = await this.searchApp.searchQueries(cmd.queryIds);

		const artifacts: Artifact[] = [];
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			const queryId = cmd.queryIds[i];
			const extracted = await this.extract({ ...cmd, dtos: result, queryId });
			artifacts.push(...extracted);
		}

		return artifacts;
	}

	async extract(cmd: ArtifactExtractCmd): Promise<Artifact[]> {
		const { userId, painId, queryId, dtos } = cmd;

		const artifacts = await Promise.all(
			dtos.map(async (dto) => {
				const result = await this.extractor.extract(dto.markdown, '');
				const artifacts = await this.parseArtifacts(painId, queryId, dto, result);
				await this.artifactIndexer.add(userId, artifacts);
				return artifacts;
			})
		);
		return artifacts.flat();
	}

	async parseArtifacts(
		painId: string,
		queryId: string,
		dto: SearchResult,
		schema: z.infer<typeof ExtractorResultSchema>
	): Promise<Artifact[]> {
		const artifacts: Artifact[] = [];
		for (const quote of schema.quotes) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Quote from ${dto.title}`,
				pain: painId,
				searchQuery: queryId,
				source: dto.url,
				type: 'quote',
				metadata: dto.metadata,
				payload: quote,
				importance: quote.importance
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		for (const insight of schema.insights) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Insight from ${dto.title}`,
				pain: painId,
				searchQuery: queryId,
				source: dto.url,
				type: 'insight',
				payload: insight,
				importance: insight.importance,
				metadata: dto.metadata
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		for (const competitor of schema.competitors) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Competitor ${competitor.name}`,
				pain: painId,
				searchQuery: queryId,
				source: dto.url,
				type: 'competitor',
				payload: competitor,
				importance: competitor.importance,
				metadata: dto.metadata
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		for (const hack of schema.hacks) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Hack from ${dto.title}`,
				pain: painId,
				searchQuery: queryId,
				source: dto.url,
				type: 'hack',
				payload: hack,
				importance: hack.importance,
				metadata: dto.metadata
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		return artifacts;
	}
}
