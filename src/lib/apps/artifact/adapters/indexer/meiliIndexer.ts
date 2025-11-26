import { type Index, MeiliSearch, type UserProvidedEmbedder } from 'meilisearch';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';

import { EMBEDDERS, voyage } from '$lib/shared/server';

import { ArtifactsTypeOptions, Collections, nanoid, pb } from '$lib/shared';

import type { Artifact, ArtifactIndexer } from '../../core';

const BATCH_SIZE = 128;
const OUTPUT_DIMENSION = 1024;
const VOYAGE_EMBEDDER = 'voyage';
const SEARCH_RATIO = 0.75;
const CHUNK_TOKEN_LIMIT = 256;

type ArtifactDoc = {
	id: string;

	userId: string;
	painId: string;
	searchQueryId: string;
	type: ArtifactsTypeOptions;
	payload: string;
	source: string;

	createdAt: string;
	tokens: number;
	_vectors: Record<string, number[]>;
};

export const EVENT_EMBEDDERS = {
	[VOYAGE_EMBEDDER]: {
		source: 'userProvided',
		dimensions: OUTPUT_DIMENSION
	} as UserProvidedEmbedder
};

export class MeiliArtifactIndexer implements ArtifactIndexer {
	private readonly client?: MeiliSearch;
	private readonly index?: Index<ArtifactDoc>;

	constructor() {
		if (building) return;

		this.client = new MeiliSearch({
			host: env.MEILI_URL,
			apiKey: env.MEILI_MASTER_KEY
		});
		this.index = this.client.index('events');
	}

	async migrate(): Promise<void> {
		if (!this.index) return;
		await this.index.updateEmbedders(EVENT_EMBEDDERS);
		await this.index.updateFilterableAttributes([
			'type',
			'userId',
			'painId',
			'searchQueryId',
			'createdAt',
			'source'
		]);
	}

	async add(userId: string, artifacts: Artifact[]): Promise<void> {
		if (!this.index) return;
		if (artifacts.length === 0) {
			console.log('No artifacts to index');
			return;
		}

		const docs: ArtifactDoc[] = [];

		console.log(`Indexing ${artifacts.length} artifacts`);

		const embedTasks = [];
		for (let i = 0; i < artifacts.length; i += BATCH_SIZE) {
			const batch = artifacts.slice(i, i + BATCH_SIZE).map((artifact) => {
				return `
Artifact from: ${artifact.data.source}                
Artifact type: ${artifact.data.type}
Artifact payload: ${JSON.stringify(artifact.data.payload)}
`;
			});
			embedTasks.push(
				voyage.embed({
					input: batch,
					model: EMBEDDERS.VOYAGE_LITE,
					inputType: 'document',
					outputDimension: OUTPUT_DIMENSION
				})
			);
		}
		const embeddings = (await Promise.all(embedTasks))
			.flatMap((res) => res.data)
			.map((res) => res?.embedding);

		for (let i = 0; i < artifacts.length; i++) {
			const artifact = artifacts[i];
			const embedding = embeddings[i];
			if (!embedding) {
				console.warn('Embedding is not valid', artifact);
				continue;
			}

			const id = `${artifact.data.type}-${artifact.data.pain}-${artifact.data.searchQuery}-${nanoid()}`;
			const doc: ArtifactDoc = {
				id,
				type: artifact.data.type,
				painId: artifact.data.pain,
				searchQueryId: artifact.data.searchQuery,
				payload: JSON.stringify(artifact.data.payload),
				source: artifact.data.source,
				userId,
				createdAt: new Date().toISOString(),
				tokens: 0,
				_vectors: { [VOYAGE_EMBEDDER]: embedding }
			};
			docs.push(doc);
		}

		if (docs.length === 0) {
			console.warn('No documents to add after processing embeddings');
			return;
		}

		try {
			const task = await this.index!.addDocuments(docs, { primaryKey: 'id' });
			console.log(
				`Successfully indexed ${docs.length} artifact documents. Task ID: ${task.taskUid}`
			);
		} catch (error) {
			console.error('Error indexing artifact documents:', error);
			throw error;
		}
	}

	async search(
		userId: string,
		query: string,
		tokens: number,
		painId?: string,
		searchQueryId?: string,
		type?: ArtifactsTypeOptions
	): Promise<Artifact[]> {
		const limit = Math.floor(tokens / CHUNK_TOKEN_LIMIT);

		let f = `userId = "${userId}"`;
		if (painId) f += ` AND painId = "${painId}"`;
		if (searchQueryId) f += ` AND searchQueryId = "${searchQueryId}"`;
		if (type) f += ` AND type = "${type}"`;

		const vector = (
			await voyage.embed({
				input: [query],
				model: EMBEDDERS.VOYAGE_LITE,
				inputType: 'document',
				outputDimension: OUTPUT_DIMENSION
			})
		).data?.[0]?.embedding;
		if (!vector) {
			console.warn('Vector is not valid', query);
			return [];
		}

		const res = await this.index!.search(query, {
			vector,
			filter: f,
			limit,
			hybrid: {
				embedder: VOYAGE_EMBEDDER,
				semanticRatio: SEARCH_RATIO
			}
		});
		return await pb.collection(Collections.Artifacts).getFullList({
			filter: `userId = "${userId}" && id ?= "${res.hits.map((hit) => hit.id).join(',')}"`
		});
	}
}
