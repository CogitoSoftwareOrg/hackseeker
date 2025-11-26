import z from 'zod';

import type { Artifact } from './models';
import type { ArtifactsTypeOptions } from '$lib/shared';

export const ExtractorResultSchema = z.object({
	quotes: z.array(
		z.object({
			content: z.string().describe('The quote content'),
			author: z.string()
		})
	),
	insights: z.array(
		z.object({
			content: z.string().describe('The meaning of the insight')
		})
	),
	competitors: z.array(
		z.object({
			name: z.string().describe('The name of the competitor'),
			description: z.string().describe('The description of the competitor'),
			links: z.array(z.string()).describe('List of links to the competitor')
		})
	),
	hacks: z.array(
		z.object({
			description: z.string().describe('The description of the hack')
		})
	)
});

export interface Extractor {
	extract(content: string): Promise<z.infer<typeof ExtractorResultSchema>>;
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
