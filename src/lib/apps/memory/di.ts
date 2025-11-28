import { MeiliProfileIndexer, MeiliEventIndexer } from './adapters';
import { MemoryAppImpl } from './app';
import type { MemoryApp } from './core';

export const getMemoryApp = (): MemoryApp => {
	const profileIndexer = new MeiliProfileIndexer();
	const eventIndexer = new MeiliEventIndexer();

	Promise.all([profileIndexer.migrate(), eventIndexer.migrate()]).then(() => {
		console.log('Memory indexers migrated');
	});

	return new MemoryAppImpl(profileIndexer, eventIndexer);
};
