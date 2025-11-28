import z from 'zod';
import { zodFunction } from 'openai/helpers/zod.js';

export const createPainTool = zodFunction({
	name: 'create_pain',
	description: 'Create a new pain draft',
	parameters: z.object({
		segment: z.string().describe('The segment of the pain. 1-3 words max.'),
		problem: z.string().describe('The problem exprienced by the segment. 1 small sentence max.'),
		jtbd: z.string().describe('The job to be done for the segment. 1 small sentence max.'),
		keywords: z.array(z.string()).describe('The keywords to search for the pain')
	})
});

export const updatePainTool = zodFunction({
	name: 'update_pain',
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
