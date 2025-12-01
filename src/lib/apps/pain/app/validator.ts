import { Collections, PainsStatusOptions, type PainsResponse, pb } from '$lib';
import type { SearchApp } from '$lib/apps/search/core';

import { Pain, type PainKeywords, type PainValidator, type PainMetrics } from '../core';

export class PainValidatorImpl implements PainValidator {
	constructor(private readonly searchApp: SearchApp) {}

	async startValidation(painId: string): Promise<Pain> {
		const painRec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(painId, { status: PainsStatusOptions.validation });
		const pain = Pain.fromResponse(painRec);

		await this.searchApp.generateQueries(painId, pain.prompt);

		return pain;
	}
}
