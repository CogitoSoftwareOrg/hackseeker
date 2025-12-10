import { env } from '$env/dynamic/private';

import { Collections, pb, type ChunksResponse, type SourcesResponse } from '$lib/shared';
import { countTokens } from '$lib/shared/server';
import { type Normalizer, NORMILIZE_CHUNK_CHAR_LIMIT } from '../../core';

export type UnstructuredChunk = {
	element_id: string;
	text: string;
	type: string;
	metadata: Record<string, unknown>;
};

export class UnstrcturedNormilizer implements Normalizer {
	constructor() {}

	async normalize(source: SourcesResponse, file: File): Promise<ChunksResponse[]> {
		const formData = new FormData();

		formData.append('files', file, source.file ?? file.name);
		formData.append('chunking_strategy', 'by_title');
		formData.append('max_characters', String(NORMILIZE_CHUNK_CHAR_LIMIT));
		// formData.append('combine_under_n_chars', String(NORMILIZE_CHUNK_CHAR_LIMIT));
		formData.append('overlap', String(Math.floor(NORMILIZE_CHUNK_CHAR_LIMIT / 5)));
		formData.append('strategy', 'fast');

		// Optimization settings
		formData.append('extract_tables', 'false');
		formData.append('include_page_breaks', 'false');
		formData.append('skip_infer_table_types', 'false');
		formData.append('iscale_layout', 'false');

		const response = await fetch(`${env.UNSTRUCTURED_URL}/general/v0/general`, {
			method: 'POST',
			headers: {
				'unstructured-api-key': env.UNSTRUCTURED_API_KEY
			},
			body: formData
		});

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new Error(
				`Failed to normalize via Unstructured: ${response.status} ${response.statusText} ${text}`
			);
		}

		const elements = (await response.json()) as UnstructuredChunk[];

		const chunks = await Promise.all(
			elements.map(async (element) => {
				return await pb.collection(Collections.Chunks).create({
					source: source.id,
					content: element.text,
					tokens: countTokens(element.text),
					metadata: element.metadata
				});
			})
		);

		return chunks;
	}
}
