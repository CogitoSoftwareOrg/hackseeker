import type { ChatApp } from '$lib/apps/chat/core';
import type { PainApp } from '$lib/apps/pain/core';
import type { UserApp } from '$lib/apps/user/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';

import { SEARCH_LIMIT } from '$lib/apps/search/core';

import type { EdgeApp, SearchArtifactsCmd, StartPainValidationCmd, StreamChatCmd } from '../core';

const DEFAULT_CHARGE_AMOUNT = 1;

const SEARCH_QUERY_CHARGE_AMOUNT = 1 * SEARCH_LIMIT;

export class EdgeAppImpl implements EdgeApp {
	constructor(
		private readonly userApp: UserApp,
		private readonly chatApp: ChatApp,
		private readonly painApp: PainApp,
		private readonly artifactApp: ArtifactApp
	) {}

	async searchArtifacts(cmd: SearchArtifactsCmd): Promise<void> {
		const { principal, painId, queryIds } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining <= SEARCH_QUERY_CHARGE_AMOUNT * queryIds.length)
			throw new Error('Insufficient balance');

		await this.artifactApp.search({
			userId: principal.user.id,
			painId,
			queryIds
		});

		await this.userApp.charge({
			subId: principal.sub.id,
			amount: SEARCH_QUERY_CHARGE_AMOUNT * queryIds.length
		});
	}

	async startPainValidation(cmd: StartPainValidationCmd): Promise<void> {
		const { principal, painId } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining <= 0) throw new Error('Insufficient balance');

		await this.painApp.startValidation(painId);

		await this.userApp.charge({ subId: principal.sub.id, amount: DEFAULT_CHARGE_AMOUNT });
	}

	async streamChat(cmd: StreamChatCmd): Promise<ReadableStream> {
		const { principal, chatId, query } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining <= 0) throw new Error('Insufficient balance');

		const chatApp = this.chatApp;
		const userApp = this.userApp;
		let charged = false;

		return new ReadableStream({
			async start(controller) {
				try {
					const stream = await chatApp.runStream({ principal, chatId, query });
					const reader = stream.getReader();
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						controller.enqueue(value);
					}
					controller.close();
				} finally {
					if (!charged) {
						await userApp.charge({ subId: principal.sub.id, amount: DEFAULT_CHARGE_AMOUNT });
						charged = true;
					}
				}
			}
		});
	}
}
