import type { PainApp } from '$lib/apps/pain/core';
import type { UserApp } from '$lib/apps/user/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';

import { SEARCH_LIMIT } from '$lib/apps/search/core';

import type {
	EdgeApp,
	GenPainPdfCmd,
	GenPainLandingCmd,
	SearchArtifactsCmd,
	StartPainValidationCmd,
	StreamChatCmd
} from '../core';

const DEFAULT_CHARGE_AMOUNT = 1;

const SEARCH_QUERY_CHARGE_AMOUNT = 1 * SEARCH_LIMIT;

const PDF_CHARGE_AMOUNT = 10;
const LANDING_CHARGE_AMOUNT = 10;

export class EdgeAppImpl implements EdgeApp {
	constructor(
		private readonly userApp: UserApp,
		private readonly painApp: PainApp,
		private readonly artifactApp: ArtifactApp
	) {}

	async genPainPdf(cmd: GenPainPdfCmd): Promise<void> {
		const { principal, painId, chatId } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining < PDF_CHARGE_AMOUNT) throw new Error('Insufficient balance');

		await this.painApp.genPdf({
			userId: principal.user.id,
			chatId,
			painId
		});

		await this.userApp.charge({ subId: principal.sub.id, amount: PDF_CHARGE_AMOUNT });
	}

	async genPainLanding(cmd: GenPainLandingCmd): Promise<void> {
		const { principal, painId, chatId } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining < LANDING_CHARGE_AMOUNT) throw new Error('Insufficient balance');

		await this.painApp.genLanding({
			userId: principal.user.id,
			chatId,
			painId
		});

		await this.userApp.charge({ subId: principal.sub.id, amount: LANDING_CHARGE_AMOUNT });
	}

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
		const { principal, painId, chatId } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining <= 0) throw new Error('Insufficient balance');

		await this.painApp.startValidation(painId, chatId);

		await this.userApp.charge({ subId: principal.sub.id, amount: DEFAULT_CHARGE_AMOUNT });
	}

	async streamChat(cmd: StreamChatCmd): Promise<ReadableStream> {
		console.log('edge.streamChat');
		const { principal, chatId, query } = cmd;
		if (!principal) throw new Error('Unauthorized');
		if (principal.remaining <= 0) throw new Error('Insufficient balance');

		const painApp = this.painApp;
		const userApp = this.userApp;
		let charged = false;

		return new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				const sendEvent = (event: string, data: string) => {
					controller.enqueue(encoder.encode(`event: ${event}\n`));
					controller.enqueue(encoder.encode(`data: ${data}\n\n`));
				};

				try {
					const stream = await painApp.askStream({
						mode: cmd.mode,
						userId: principal.user.id,
						chatId,
						query
					});
					const reader = stream.getReader();
					while (true) {
						const { value, done } = await reader.read();
						if (done) break;
						sendEvent('chunk', value);
					}
					sendEvent('done', '');
					controller.close();
				} catch (error) {
					console.error(error);
					sendEvent('error', JSON.stringify(error));
					controller.error(error);
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
