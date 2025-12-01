import { type Index, MeiliSearch, type UserProvidedEmbedder } from 'meilisearch';
import { env } from '$env/dynamic/private';

import { nanoid } from '$lib/shared';
import { EMBEDDERS, voyage } from '$lib/shared/server';

import type { UserMemory, UserIndexer, Importance } from '../../core';
import { building } from '$app/environment';

const BATCH_SIZE = 128;

const VOYAGE_EMBEDDER = 'voyage';
const OUTPUT_DIMENSION = 1024;
const SEARCH_RATIO = 0.75;
const CHUNK_TOKEN_LIMIT = 256;

export type UserDoc = {
	id: string;
	userId: string;
	content: string;
	tokens: number;
	createdAt: string;
	importance: Importance;
	_vectors: Record<string, number[]>;
};

export const USER_EMBEDDERS = {
	[VOYAGE_EMBEDDER]: {
		source: 'userProvided',
		dimensions: OUTPUT_DIMENSION
	} as UserProvidedEmbedder
};

export class MeiliUserIndexer implements UserIndexer {
	private readonly client?: MeiliSearch;
	private readonly index?: Index<UserDoc>;

	constructor() {
		if (building) return;
		this.client = new MeiliSearch({
			host: env.MEILI_URL,
			apiKey: env.MEILI_MASTER_KEY
		});
		this.index = this.client.index('profiles');
	}

	async migrate(): Promise<void> {
		if (!this.index) return;
		await this.index.updateEmbedders(USER_EMBEDDERS);
		await this.index.updateFilterableAttributes(['userId', 'createdAt', 'importance']);
	}

	async add(memories: UserMemory[]): Promise<void> {
		if (!this.index) return;
		if (memories.length === 0) {
			console.log('No user memories to index');
			return;
		}

		const docs: UserDoc[] = [];

		const validMemories = memories.filter((memory) => {
			if (memory.tokens > CHUNK_TOKEN_LIMIT) {
				console.warn('User memory tokens are too high', memory);
				return false;
			}
			if (!memory.userId) {
				console.warn('User ID is not valid', memory);
				return false;
			}
			return true;
		});

		if (validMemories.length === 0) {
			console.warn('No valid user memories after filtering');
			return;
		}

		console.log(`Indexing ${validMemories.length} profile memories`);

		const embedTasks = [];
		for (let i = 0; i < validMemories.length; i += BATCH_SIZE) {
			const batch = validMemories.slice(i, i + BATCH_SIZE).map((memory) => memory.content);
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

		for (let i = 0; i < validMemories.length; i++) {
			const memory = validMemories[i];
			const embedding = embeddings[i];
			if (!embedding) {
				console.warn('Embedding is not valid', memory);
				continue;
			}

			const id = `${memory.userId}-${nanoid()}`;
			const doc: UserDoc = {
				id,
				userId: memory.userId,
				content: memory.content,
				tokens: memory.tokens,
				importance: memory.importance,
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
			console.log(
				`Successfully indexed ${docs.length} profile documents. Task ID: ${task.taskUid}`
			);
		} catch (error) {
			console.error('Error indexing profile documents:', error);
			throw error;
		}
	}

	async search(query: string, tokens: number, userId: string): Promise<UserMemory[]> {
		const limit = Math.floor(tokens / CHUNK_TOKEN_LIMIT);

		const f = this.buildUsersFilter([userId]);

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

		const memories: UserMemory[] = res.hits.map((hit) => ({
			userId: hit.userId,
			content: hit.content,
			tokens: hit.tokens,
			importance: hit.importance,
			createdAt: hit.createdAt
		}));
		return memories;
	}

	private buildUsersFilter(userIds: string[]): string {
		if (userIds.length === 0) return '';

		const personalFilter = `(userId = "${userIds[0]}")`;

		const pairFilters: string[] = [];

		for (let i = 0; i < userIds.length; i++) {
			for (let j = i + 1; j < userIds.length; j++) {
				const a = userIds[i];
				const b = userIds[j];

				pairFilters.push(`(userId = "${a}" AND userId = "${b}")`);
			}
		}

		if (pairFilters.length === 0) {
			return personalFilter;
		}

		return `${personalFilter} OR ${pairFilters.join(' OR ')}`;
	}
}
