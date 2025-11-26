import z from 'zod';

import { SearchQueriesTypeOptions } from '$lib/shared';

export const QueryGeneratorSchema = z.object({
	queries: z.array(
		z.object({
			query: z.string().describe('The query that will be used to search for results in the web'),
			type: z
				.enum(Object.values(SearchQueriesTypeOptions))
				.describe('The type of the query that will be used to search for results in the web')
		})
	)
});

export interface QueryGenerator {
	generate(prompt: string): Promise<z.infer<typeof QueryGeneratorSchema>>;
}
