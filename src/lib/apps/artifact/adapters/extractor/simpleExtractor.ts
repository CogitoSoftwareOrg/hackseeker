import z from 'zod';

import type { Extractor, ExtractorResultSchema } from '../../core';

export class SimpleExtractor implements Extractor {
	async extract(markdown: string): Promise<z.infer<typeof ExtractorResultSchema>> {
		console.log('Extracting markdown:', markdown);
		return {
			quotes: [],
			insights: [],
			competitors: [],
			hacks: []
		};
	}
}
