import { JobAppImpl } from './app';
import type { JobApp } from './core';

export const getJobApp = (): JobApp => {
	return new JobAppImpl();
};
