import { PainsStatusOptions } from '$lib';
import type { ChatApp } from '$lib/apps/chat/core';
import type { SearchApp } from '$lib/apps/search/core';

import { Pain, type PainValidator, type PainCrud } from '../core';

export class PainValidatorImpl implements PainValidator {
	constructor(
		private readonly crud: PainCrud,
		private readonly searchApp: SearchApp,
		private readonly chatApp: ChatApp
	) {}

	async startValidation(painId: string, chatId: string): Promise<Pain> {
		const pain = await this.crud.update({ id: painId, status: PainsStatusOptions.validation });
		await this.chatApp.update(chatId, { title: pain.data.segment, pain: painId });
		await this.searchApp.generateQueries(painId, pain.prompt);

		return pain;
	}
}
