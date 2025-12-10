import { type Index, MeiliSearch, type UserProvidedEmbedder } from 'meilisearch';
import { env } from '$env/dynamic/private';

import { Collections, pb, type ChunksResponse } from '$lib/shared';
import { voyageEmbed } from '$lib/shared/server';

import type { ChunksIndexer } from '../../core';

const BATCH_SIZE = 128;

const VOYAGE_EMBEDDER = 'voyage';
const OUTPUT_DIMENSION = 1024;
const SEARCH_RATIO = 0.75;
const CHUNK_TOKEN_LIMIT = 512;

export type ChunkDoc = {
	id: string;
	userId: string;
	sourceId: string;
	content: string;
	tokens: number;
	createdAt: string;
	_vectors: Record<string, number[]>;
};

export const CHUNKS_EMBEDDERS = {
	[VOYAGE_EMBEDDER]: {
		source: 'userProvided',
		dimensions: OUTPUT_DIMENSION
	} as UserProvidedEmbedder
};

export class MeiliChunksIndexer implements ChunksIndexer {
	private readonly client: MeiliSearch;
	private readonly index: Index<ChunkDoc>;

	constructor() {
		this.client = new MeiliSearch({
			host: env.MEILI_URL,
			apiKey: env.MEILI_MASTER_KEY
		});
		this.index = this.client.index('chunks');
	}

	async migrate(): Promise<void> {
		await this.index.updateEmbedders(CHUNKS_EMBEDDERS);
		await this.index.updateFilterableAttributes(['userId', 'sourceId', 'createdAt']);
	}

	async add(chunks: ChunksResponse[], userId: string): Promise<void> {
		if (chunks.length === 0) {
			console.log('No chunks to index');
			return;
		}

		const docs: ChunkDoc[] = [];

		const validChunks = chunks.filter((chunk) => {
			if (chunk.tokens > CHUNK_TOKEN_LIMIT) {
				console.warn('Chunk tokens are too high', chunk.tokens);
				return false;
			}
			return true;
		});
		if (validChunks.length === 0) {
			console.warn('No valid chunks after filtering');
			return;
		}

		console.log(`Indexing ${validChunks.length} chunks`);

		const embeddings = await voyageEmbed(
			validChunks.map((chunk) => chunk.content),
			BATCH_SIZE,
			OUTPUT_DIMENSION
		);

		for (let i = 0; i < validChunks.length; i++) {
			const chunk = validChunks[i];
			const embedding = embeddings[i] ?? [];
			if (!embedding) {
				console.warn('Embedding is not valid', chunk);
				continue;
			}

			const doc: ChunkDoc = {
				id: chunk.id,
				userId,
				sourceId: chunk.source,
				content: chunk.content,
				tokens: chunk.tokens,
				createdAt: new Date().toISOString(),
				_vectors: {
					[VOYAGE_EMBEDDER]: embedding
				}
			};
			docs.push(doc);
		}

		if (docs.length === 0) {
			console.warn('No documents to add after processing embeddings');
			return;
		}

		try {
			const task = await this.index.addDocuments(docs, { primaryKey: 'id' });
			console.log(`Successfully indexed ${docs.length} chunks. Task ID: ${task.taskUid}`);
		} catch (error) {
			console.error('Error indexing chunks:', error);
			throw error;
		}
	}

	async search(
		query: string,
		tokens: number,
		sourceIds: string[],
		userId: string
	): Promise<ChunksResponse[]> {
		const limit = Math.floor(tokens / CHUNK_TOKEN_LIMIT);

		const f = this.buildSourceIdsFilter(userId, sourceIds);

		const vector = (await voyageEmbed([query], BATCH_SIZE, OUTPUT_DIMENSION)).at(0);
		if (!vector) {
			console.warn('Vector is not valid', query);
			return [];
		}

		const res = await this.index.search(query, {
			vector,
			filter: f,
			limit,
			hybrid: {
				embedder: VOYAGE_EMBEDDER,
				semanticRatio: SEARCH_RATIO
			}
		});

		const chunkIds = res.hits.map((hit) => hit.id);
		return await pb.collection(Collections.Chunks).getFullList({
			filter: `id = "${chunkIds.join('" || id = "')}"`
		});
	}

	async remove(userId: string, sourceIds: string[]): Promise<void> {
		await this.index.deleteDocuments({ filter: this.buildSourceIdsFilter(userId, sourceIds) });
	}

	private buildSourceIdsFilter(userId: string, sourceIds: string[]): string {
		let f = `(userId = "${userId}")`;
		if (sourceIds.length > 0) {
			f += ` AND (sourceId IN [${sourceIds.join(',')}]`;
		}
		return f;
	}
}
