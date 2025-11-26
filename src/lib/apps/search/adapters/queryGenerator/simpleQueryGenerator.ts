import { SearchQueriesTypeOptions } from '$lib/shared';

import type { QueryGenerator } from '../../core';

export class SimpleQueryGenerator implements QueryGenerator {
	async generate(prompt: string) {
		return Promise.resolve({
			queries: [{ query: prompt, type: SearchQueriesTypeOptions.communityPain }]
		});
	}
}
