import {
	Pain,
	type PainCreateCmd,
	type PainKeywords,
	type PainMetrics,
	type PainUpdateCmd,
	type PainCrud
} from '../core';
import { Collections, PainsStatusOptions, pb, type PainsResponse } from '$lib/shared';

export class PainCrudImpl implements PainCrud {
	constructor() {}

	async getByChatId(chatId: string, status?: PainsStatusOptions): Promise<Pain[]> {
		const recs: PainsResponse<PainKeywords, PainMetrics>[] = await pb
			.collection(Collections.Pains)
			.getFullList({
				filter: status
					? `chats:each = "${chatId}" && archived = null && status = "${status}"`
					: `chats:each = "${chatId}" && archived = null`
			});
		return recs.map(Pain.fromResponse);
	}

	async getById(id: string): Promise<Pain> {
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.getOne(id);
		return Pain.fromResponse(rec);
	}

	async create(cmd: PainCreateCmd) {
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.create({ ...cmd, status: PainsStatusOptions.draft, chats: [cmd.chatId], user: cmd.userId });
		return Pain.fromResponse(rec);
	}

	async update(cmd: PainUpdateCmd) {
		const dto = {
			segment: cmd.segment ?? undefined,
			problem: cmd.problem ?? undefined,
			jtbd: cmd.jtbd ?? undefined,
			keywords: cmd.keywords ?? undefined
		};
		const rec: PainsResponse<PainKeywords, PainMetrics> = await pb
			.collection(Collections.Pains)
			.update(cmd.id, dto);
		return Pain.fromResponse(rec);
	}
}
