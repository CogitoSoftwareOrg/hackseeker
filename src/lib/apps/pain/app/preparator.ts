import { PainsStatusOptions, type MessagesResponse } from '$lib/shared';
import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { ChatApp, OpenAIMessage } from '$lib/apps/chat/core';
import type { UserApp } from '$lib/apps/user/core';

import { type WorkflowMode, type PainCrud } from '../core';

const HISTORY_TOKENS = 2000;
const USER_TOKENS = 5000;
const CHAT_EVENT_TOKENS = 5000;
const ARTIFCAT_TOKENS = 5000;

export class PreparatorImpl {
	constructor(
		// INTERNAL STRATEGIES
		private readonly crud: PainCrud,

		// APPS
		private readonly chatApp: ChatApp,
		private readonly userApp: UserApp,
		private readonly artifactApp: ArtifactApp
	) {}

	// PRIVATE UTILS
	async prepare(
		mode: WorkflowMode,
		chatId: string,
		userId: string,
		query: string
	): Promise<{
		history: OpenAIMessage[];
		aiMsg: MessagesResponse;
		userMsg: MessagesResponse;
		knowledge: string;
	}> {
		const { aiMsg, userMsg } = await this.chatApp.prepareMessages(chatId, query);

		const history = await this.chatApp.getHistory(chatId, HISTORY_TOKENS);

		const knowledge = await this.buildKnowledge(mode, userId, chatId, query);

		return { history, aiMsg, userMsg, knowledge };
	}

	async buildKnowledge(
		mode: WorkflowMode,
		userId: string,
		chatId: string,
		query: string
	): Promise<string> {
		let knowledge = '';

		const status = mode === 'validation' ? PainsStatusOptions.validation : undefined;
		const pains = await this.crud.getByChatId(chatId, status);
		knowledge += pains
			.map((pain) => {
				return `- ${pain.prompt}`;
			})
			.join('\n');

		const userMemories = await this.userApp.getMemories({
			userId: userId,
			query: query,
			tokens: USER_TOKENS
		});
		if (userMemories.length > 0) {
			knowledge += '\n\nUser memories:';
			knowledge += userMemories.map((user) => `- ${user.content}`).join('\n');
		}

		const chatEventMemories = await this.chatApp.getMemories({
			chatId: chatId,
			query: query,
			tokens: CHAT_EVENT_TOKENS
		});
		if (chatEventMemories.length > 0) {
			knowledge += '\n\nChat event memories:';
			knowledge += chatEventMemories.map((chatEvent) => `- ${chatEvent.content}`).join('\n');
		}

		if (mode === 'validation') {
			const pain = pains[0]!;
			const artifactMemories = await this.artifactApp.getMemories({
				userId: userId,
				painId: pain.data.id,
				query: query,
				tokens: ARTIFCAT_TOKENS
			});
			if (artifactMemories.length > 0) {
				knowledge += '\n\nArtifact memories:';
				knowledge += artifactMemories.map((artifact) => `- ${artifact.data.payload}`).join('\n');
			}
		}

		return knowledge;
	}
}
