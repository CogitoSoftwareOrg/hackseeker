import { zodFunction } from 'openai/helpers/zod.js';
import z from 'zod';

import { ProfileType, Importance, EventType } from './models';

export const SearchMemoriesToolSchema = zodFunction({
	name: 'search_memories',
	description: 'Search the memories for relevant information',
	parameters: z.object({
		query: z.string().describe('The query to search for')
	})
});

export const SaveMemoriesToolSchema = zodFunction({
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
