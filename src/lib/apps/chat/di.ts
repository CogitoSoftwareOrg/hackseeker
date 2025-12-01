import { ChatAppImpl } from './app';
import { MeiliChatEventIndexer } from './adapters';

export const getChatApp = () => {
	const chatEventIndexer = new MeiliChatEventIndexer();
	chatEventIndexer.migrate().then(() => {
		console.log('Chat event indexers migrated');
	});
	return new ChatAppImpl(chatEventIndexer);
};
