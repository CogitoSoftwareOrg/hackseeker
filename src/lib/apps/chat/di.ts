import type { Agent } from '$lib/shared/server';

import { ChatAppImpl } from './app';
import { MeiliChatEventIndexer, NamerAgent } from './adapters';
import type { UtilsMode } from './core';

export const getChatApp = () => {
	const agents: Record<UtilsMode, Agent> = {
		name: new NamerAgent()
	};
	const chatEventIndexer = new MeiliChatEventIndexer();
	chatEventIndexer.migrate().then(() => {
		console.log('Chat event indexers migrated');
	});
	return new ChatAppImpl(agents, chatEventIndexer);
};
