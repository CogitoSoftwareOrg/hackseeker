import { MeiliUserIndexer } from './adapters';
import { UserAppImpl } from './app';

export const getUserApp = () => {
	const userIndexer = new MeiliUserIndexer();
	userIndexer.migrate().then(() => {
		console.log('User indexers migrated');
	});
	return new UserAppImpl(userIndexer);
};
