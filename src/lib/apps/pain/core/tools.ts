import { zodFunction } from 'openai/helpers/zod.js';
import z from 'zod';

import { Importance as ChatImportance, EventType as ChatEventType } from '$lib/apps/chat/core';
import { Importance as UserImportance } from '$lib/apps/user/core';

export const CreatePainToolSchema = zodFunction({
	name: 'createPain',
	description: 'Create a new pain draft',
	parameters: z.object({
		segment: z.string().describe('The segment of the pain. 1-3 words max.'),
		problem: z.string().describe('The problem exprienced by the segment. 1 small sentence max.'),
		jtbd: z.string().describe('The job to be done for the segment. 1 small sentence max.'),
		keywords: z.array(z.string()).describe('The keywords to search for the pain')
	})
});

export const UpdatePainToolSchema = zodFunction({
	name: 'updatePain',
	description: 'Update a pain draft',
	parameters: z.object({
		id: z.string().describe('The id of the pain'),
		segment: z.string().describe('The segment of the pain.').optional().nullable(),
		problem: z.string().describe('The problem exprienced by the segment.').optional().nullable(),
		jtbd: z.string().describe('The job to be done for the segment').optional().nullable(),
		keywords: z
			.array(z.string())
			.describe('The keywords to search for the pain')
			.optional()
			.nullable()
	})
});

export const SearchMemoriesToolSchema = zodFunction({
	name: 'searchMemories',
	description: 'Search the memories for relevant information',
	parameters: z.object({
		query: z.string().describe('The query to search for')
	})
});

export const SaveMemoriesToolSchema = zodFunction({
	name: 'saveMemories',
	description: 'Save important new memories',
	parameters: z.object({
		users: z.array(
			z.object({
				importance: z.enum(Object.values(UserImportance)).describe('The importance of the profile'),
				content: z.string().describe('The content of the profile')
			})
		),
		chatEvents: z.array(
			z.object({
				type: z.enum(Object.values(ChatEventType)).describe('The type of the chat event'),
				importance: z.enum(Object.values(ChatImportance)).describe('The importance of the event'),
				content: z.string().describe('The content of the chat event')
			})
		)
	})
});
