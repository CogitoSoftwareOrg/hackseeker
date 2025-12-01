// import { zodFunction } from 'openai/helpers/zod.js';
// import z from 'zod';

// import { Importance } from './models';

// export const SearchUserMemoriesToolSchema = zodFunction({
// 	name: 'search_user_memories',
// 	description: 'Search the users for relevant information',
// 	parameters: z.object({
// 		query: z.string().describe('The query to search for')
// 	})
// });

// export const SaveUserMemoriesToolSchema = zodFunction({
// 	name: 'save_user_memories',
// 	description: 'Save important new memories',
// 	parameters: z.object({
// 		newMemories: z.array(
// 			z.object({
// 				importance: z.enum(Object.values(Importance)).describe('The importance of the profile'),
// 				content: z.string().describe('The content of the profile')
// 			})
// 		)
// 	})
// });
