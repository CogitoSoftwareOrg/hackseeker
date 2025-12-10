import { Collections, type Create } from '$lib';

import { sourcesStore } from './sources.svelte';

export class SourceApi {
	async addSource(dto: Create<Collections.Sources>, file: File) {
		sourcesStore.addOptimistic(dto);

		const formData = new FormData();

		formData.append('file', file);
		formData.append('title', file.name);
		formData.append('metadata', JSON.stringify(dto.metadata));

		const response = await fetch('/api/sources', {
			method: 'POST',
			body: formData
		});

		if (!response.ok) {
			throw new Error('Failed to upload file');
		}

		const newSource = await response.json();
		return newSource;
	}
}

export const sourceApi = new SourceApi();
