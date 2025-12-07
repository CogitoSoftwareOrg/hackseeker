import { voyageEmbed } from '$lib/shared/server';
import { type Index, MeiliSearch, type UserProvidedEmbedder } from 'meilisearch';
import { env } from '$env/dynamic/private';

import { nanoid } from '$lib/shared';

import type { ChatEventMemory, ChatEventIndexer, EventType, Importance } from '../../core';

const BATCH_SIZE = 128;
const OUTPUT_DIMENSION = 1024;
const VOYAGE_EMBEDDER = 'voyage';
const SEARCH_RATIO = 0.75;
const CHUNK_TOKEN_LIMIT = 256;

type ChatEventDoc = {
	id: string;
	type: EventType;
	content: string;
	chatId: string;
	createdAt: string;
	tokens: number;
	importance: Importance;
	_vectors: Record<string, number[]>;
};

export const EVENT_EMBEDDERS = {
	[VOYAGE_EMBEDDER]: {
		source: 'userProvided',
		dimensions: OUTPUT_DIMENSION
	} as UserProvidedEmbedder
};

export class MeiliChatEventIndexer implements ChatEventIndexer {
	private readonly client?: MeiliSearch;
	private readonly index?: Index<ChatEventDoc>;

	constructor() {
		this.client = new MeiliSearch({
			host: env.MEILI_URL,
			apiKey: env.MEILI_MASTER_KEY
		});
		this.index = this.client.index('chatEvents');
	}

	async migrate(): Promise<void> {
		if (!this.index) return;
		await this.index.updateEmbedders(EVENT_EMBEDDERS);
		await this.index.updateFilterableAttributes(['type', 'chatId', 'createdAt', 'importance']);
	}

	async add(memories: ChatEventMemory[]): Promise<void> {
		if (!this.index) return;
		if (memories.length === 0) {
			console.log('No chat event memories to index');
			return;
		}

		const docs: ChatEventDoc[] = [];
		const validMemories = memories.filter((memory) => {
			if (memory.tokens > CHUNK_TOKEN_LIMIT) {
				console.warn('Chat event memory tokens are too high', memory);
				return false;
			}
			return true;
		});

		if (validMemories.length === 0) {
			console.warn('No valid chat event memories after filtering');
			return;
		}

		console.log(`Indexing ${validMemories.length} event memories`);

		const embeddings = await voyageEmbed(
			validMemories.map((memory) => memory.content),
			BATCH_SIZE,
			OUTPUT_DIMENSION
		);

		for (let i = 0; i < validMemories.length; i++) {
			const memory = validMemories[i];
			const embedding = embeddings[i];
			if (!embedding) {
				console.warn('Embedding is not valid', memory);
				continue;
			}

			const id = `${memory.type}-${memory.chatId}-${nanoid()}`;
			const doc: ChatEventDoc = {
				id,
				type: memory.type,
				chatId: memory.chatId,
				content: memory.content,
				importance: memory.importance,
				createdAt: new Date().toISOString(),
				tokens: memory.tokens,
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
			const task = await this.index!.addDocuments(docs, { primaryKey: 'id' });
			console.log(`Successfully indexed ${docs.length} event documents. Task ID: ${task.taskUid}`);
		} catch (error) {
			console.error('Error indexing event documents:', error);
			throw error;
		}
	}

	async search(
		query: string,
		tokens: number,
		chatId: string,
		days?: number,
		type?: EventType
	): Promise<ChatEventMemory[]> {
		const limit = Math.floor(tokens / CHUNK_TOKEN_LIMIT);

		let f = `chatId = "${chatId}"`;
		if (type) f += ` AND type = "${type}"`;
		if (days) {
			const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
			f += ` AND createdAt >= "${start.toISOString()}"`;
		}

		const vector = (await voyageEmbed([query], BATCH_SIZE, OUTPUT_DIMENSION)).at(0);
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

		const memories: ChatEventMemory[] = res.hits.map((hit) => ({
			kind: 'event',
			type: hit.type,
			chatId: hit.chatId,
			content: hit.content,
			createdAt: hit.createdAt,
			tokens: hit.tokens,
			importance: hit.importance
		}));
		return memories;
	}
}
