import { ArtifactsImportanceOptions, Collections, pb } from '$lib';
import type z from 'zod';

import {
	Artifact,
	ExtractorResultSchema,
	type ArtifactApp,
	type ArtifactExtractCmd,
	type ArtifactIndexer,
	type Extractor
} from '../core';
import type { SearchResult } from '$lib/apps/search/core';

export class ArtifactAppImpl implements ArtifactApp {
	constructor(
		private readonly extractor: Extractor,
		private readonly artifactIndexer: ArtifactIndexer
	) {}

	async extract(cmd: ArtifactExtractCmd): Promise<Artifact[]> {
		const { userId, dtos } = cmd;

		const artifacts = await Promise.all(
			dtos.map(async (dto) => {
				const result = await this.extractor.extract(dto.markdown);
				const artifacts = await this.parseArtifacts(cmd.painId, cmd.searchQueryId, dto, result);
				await this.artifactIndexer.add(userId, artifacts);
				return artifacts;
			})
		);
		return artifacts.flat();
	}

	async parseArtifacts(
		painId: string,
		searchQueryId: string,
		dto: SearchResult,
		schema: z.infer<typeof ExtractorResultSchema>
	): Promise<Artifact[]> {
		const artifacts: Artifact[] = [];
		for (const quote of schema.quotes) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Quote from ${dto.title}`,
				pain: painId,
				searchQuery: searchQueryId,
				source: dto.url,
				type: 'quote',
				metadata: dto.metadata,
				payload: quote,
				importance: ArtifactsImportanceOptions.mid
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		for (const insight of schema.insights) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Insight from ${dto.title}`,
				pain: painId,
				searchQuery: searchQueryId,
				source: dto.url,
				type: 'insight',
				payload: insight,
				importance: ArtifactsImportanceOptions.mid,
				metadata: dto.metadata
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		for (const competitor of schema.competitors) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Competitor ${competitor.name}`,
				pain: painId,
				searchQuery: searchQueryId,
				source: dto.url,
				type: 'competitor',
				payload: competitor,
				importance: ArtifactsImportanceOptions.mid,
				metadata: dto.metadata
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		for (const hack of schema.hacks) {
			const rec = await pb.collection(Collections.Artifacts).create({
				title: `Hack from ${dto.title}`,
				pain: painId,
				searchQuery: searchQueryId,
				source: dto.url,
				type: 'hack',
				payload: hack,
				importance: ArtifactsImportanceOptions.mid,
				metadata: dto.metadata
			});
			artifacts.push(Artifact.fromResponse(rec));
		}
		return artifacts;
	}
}
