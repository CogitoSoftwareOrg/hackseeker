import { SimpleQueryGenerator } from './adapters';
import { SearchAppImpl } from './app';
import type { SearchApp } from './core';

export const getSearchApp = (): SearchApp => {
	const queryGenerator = new SimpleQueryGenerator();
	return new SearchAppImpl(queryGenerator);
};
