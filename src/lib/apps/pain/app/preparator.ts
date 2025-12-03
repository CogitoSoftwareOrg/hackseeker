import { PainsStatusOptions, type MessagesResponse } from '$lib/shared';
import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { ChatApp, OpenAIMessage } from '$lib/apps/chat/core';
import type { UserApp } from '$lib/apps/user/core';

import { type AskMode, type GenMode, type PainCrud } from '../core';

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
		mode: AskMode | GenMode,
		chatId: string,
		userId: string,
		query: string,
		withMessages: boolean = true
	): Promise<{
		history: OpenAIMessage[];
		aiMsg: MessagesResponse | null;
		userMsg: MessagesResponse | null;
		knowledge: string;
	}> {
		let msgs: { aiMsg: MessagesResponse | null; userMsg: MessagesResponse | null } = {
			aiMsg: null,
			userMsg: null
		};
		if (withMessages) {
			msgs = await this.chatApp.prepareMessages(chatId, query);
		}

		const history = await this.chatApp.getHistory(chatId, HISTORY_TOKENS);
		const knowledge = await this.buildKnowledge(mode, userId, chatId, query);

		return { history, aiMsg: msgs.aiMsg, userMsg: msgs.userMsg, knowledge };
	}

	async buildKnowledge(
		mode: AskMode | GenMode,
		userId: string,
		chatId: string,
		query: string
	): Promise<string> {
		let knowledge = '';

		const status = mode === 'discovery' ? undefined : PainsStatusOptions.validation;
		const pains = await this.crud.getByChatId(chatId, status);
		knowledge += pains
			.map((pain) => {
				return `- ${pain.prompt}`;
			})
			.join('\n');

		console.log('userMemories', userId, query.slice(0, 50));
		const userMemories = await this.userApp.getMemories({
			userId: userId,
			query: query,
			tokens: USER_TOKENS
		});
		if (userMemories.length > 0) {
			knowledge += '\n\nUser memories:';
			knowledge += userMemories.map((user) => `- ${user.content}`).join('\n');
		}

		console.log('chatEventMemories', chatId, query.slice(0, 50));
		const chatEventMemories = await this.chatApp.getMemories({
			chatId: chatId,
			query: query,
			tokens: CHAT_EVENT_TOKENS
		});
		if (chatEventMemories.length > 0) {
			knowledge += '\n\nChat event memories:';
			knowledge += chatEventMemories.map((chatEvent) => `- ${chatEvent.content}`).join('\n');
		}

		if (mode !== 'discovery') {
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
