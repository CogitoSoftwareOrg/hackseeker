import { PainAppImpl } from './app';
import type { PainApp } from './core';

export const getPainApp = (): PainApp => {
	const painApp = new PainAppImpl();
	return painApp;
};
