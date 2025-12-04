import z from 'zod';

import type { Artifact } from './models';
import { ArtifactsImportanceOptions, type ArtifactsTypeOptions } from '$lib/shared';

export const ExtractorResultSchema = z.object({
	quotes: z.array(
		z.object({
			content: z.string().describe('The quote content'),
			author: z.string(),
			importance: z
				.enum(Object.values(ArtifactsImportanceOptions))
				.describe('The importance of the quote')
		})
	),
	insights: z.array(
		z.object({
			content: z.string().describe('The meaning of the insight'),
			importance: z
				.enum(Object.values(ArtifactsImportanceOptions))
				.describe('The importance of the insight')
		})
	),
	competitors: z.array(
		z.object({
			name: z.string().describe('The name of the competitor'),
			description: z.string().describe('The description of the competitor'),
			links: z.array(z.string()).describe('List of links to the competitor'),
			importance: z
				.enum(Object.values(ArtifactsImportanceOptions))
				.describe('The importance of the competitor')
		})
	),
	hacks: z.array(
		z.object({
			description: z.string().describe('The description of the hack'),
			importance: z
				.enum(Object.values(ArtifactsImportanceOptions))
				.describe('The importance of the hack')
		})
	)
});

export interface Extractor {
	extract(content: string, knowledge: string): Promise<z.infer<typeof ExtractorResultSchema>>;
}

export interface ArtifactIndexer {
	add(userId: string, artifacts: Artifact[]): Promise<void>;
	search(
		userId: string,
		query: string,
		tokens: number,
		painId?: string,
		searchQueryId?: string,
		type?: ArtifactsTypeOptions
	): Promise<Artifact[]>;
}
