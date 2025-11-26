import z from 'zod';
import { zodFunction } from 'openai/helpers/zod.js';

import type { Tool } from '$lib/apps/brain/core';
import { LLMS, TOKENIZERS } from '$lib/shared/server';

import {
	type MemoryGetCmd,
	type MemoryApp,
	type ProfileIndexer,
	type EventIndexer,
	type ProfileMemory,
	type EventMemory,
	type MemoryPutCmd,
	type StaticMemory,
	type MemporyGetResult,
	ProfileType,
	Importance,
	EventType
} from '../core';

const DAYS_TO_SEARCH_LATEST_MEMORIES = 7;
// const STATIC_TOKEN_LIMIT = 2000;

export class MemoryAppImpl implements MemoryApp {
	searchTool: Tool;
	putTool: Tool;
	constructor(
		// ADAPTERS
		private readonly profileIndexer: ProfileIndexer,
		private readonly eventIndexer: EventIndexer
	) {
		this.searchTool = zodFunction({
			name: 'search_memories',
			description: 'Search the memories for relevant information',
			parameters: z.object({
				query: z.string().describe('The query to search for')
			})
		});
		this.putTool = zodFunction({
			name: 'save_memories',
			description: 'Save important new memories',
			parameters: z.object({
				profiles: z.array(
					z.object({
						type: z.enum(Object.values(ProfileType)).describe('The type of the profile'),
						importance: z.enum(Object.values(Importance)).describe('The importance of the profile'),
						content: z.string().describe('The content of the profile')
					})
				),
				events: z.array(
					z.object({
						type: z.enum(Object.values(EventType)).describe('The type of the event'),
						importance: z.enum(Object.values(Importance)).describe('The importance of the event'),
						content: z.string().describe('The content of the event')
					})
				)
			})
		});
	}

	async get(cmd: MemoryGetCmd): Promise<MemporyGetResult> {
		let remainingTokens = cmd.tokens;
		console.log('Getting memories for chat: ', cmd.chatId);

		// STATIC
		// const staticMemories = await this.getStaticMemories(cmd.chatId, STATIC_TOKEN_LIMIT, cmd.userId);
		// cmd.tokens -= staticMemories.reduce((acc, mem) => acc + mem.tokens, 0);

		// PROFILE
		const profileMemories = await this.getProfilesMemories(
			cmd.query,
			cmd.profileId,
			Math.floor(remainingTokens / 2)
		);
		remainingTokens -= profileMemories.reduce((acc, mem) => acc + mem.tokens, 0);

		// CHAT
		const chatMemories = await this.getChatMemories(cmd.query, cmd.chatId, remainingTokens);
		return {
			static: [],
			event: chatMemories,
			profile: profileMemories
		};
	}

	async put(cmd: MemoryPutCmd): Promise<void> {
		console.log(
			`Memory put tool called, profiles: ${cmd.profiles?.length}, events: ${cmd.events?.length}`
		);
		const profileMemories: ProfileMemory[] = [];
		const eventMemories: EventMemory[] = [];

		for (const profile of cmd.profiles) {
			const tokens = TOKENIZERS[LLMS.GROK_4_FAST].encode(profile.content).length;
			profileMemories.push({
				kind: 'profile',
				type: profile.type,
				profileId: profile.profileId,
				content: profile.content,
				importance: profile.importance,
				tokens
			});
		}

		for (const event of cmd.events) {
			if (event.chatId.trim() === '') {
				console.warn('Chat ID is not valid', event);
				continue;
			}
			const tokens = TOKENIZERS[LLMS.GROK_4_FAST].encode(event.content).length;
			eventMemories.push({
				kind: 'event',
				type: event.type,
				chatId: event.chatId,
				content: event.content,
				importance: event.importance,
				tokens
			});
		}

		console.log(
			`Prepared ${profileMemories.length} profile memories and ${eventMemories.length} event memories for indexing`
		);

		try {
			await Promise.all([
				this.profileIndexer.add(profileMemories),
				this.eventIndexer.add(eventMemories)
			]);
			console.log('Successfully completed memory indexing');
		} catch (error) {
			console.error('Error in memory.put:', error);
			throw error;
		}
	}

	private async getStaticMemories() // chatId: string,
	// tokens: number,
	// characterIds: string[]
	: Promise<StaticMemory[]> {
		return [];
	}

	private async getChatMemories(
		query: string,
		chatId: string,
		tokens: number
	): Promise<EventMemory[]> {
		const half = Math.floor(tokens / 2);
		const allMemories = await this.eventIndexer.search(query, half, chatId);
		const latestMemories = await this.eventIndexer.search(
			query,
			half,
			chatId,
			DAYS_TO_SEARCH_LATEST_MEMORIES
		);
		return [...allMemories, ...latestMemories];
	}

	private async getProfilesMemories(
		query: string,
		profileId: string,
		tokens: number
	): Promise<ProfileMemory[]> {
		const memories = await this.profileIndexer.search(query, tokens, profileId);
		return memories;
	}
}
