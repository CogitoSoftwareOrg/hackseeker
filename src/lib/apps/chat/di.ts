import type { MemoryApp } from '$lib/apps/memory/core';
import type { BrainApp } from '$lib/apps/brain/core';

import { ChatAppImpl } from './app';

export const getChatApp = (memoryApp: MemoryApp, brainApp: BrainApp) => {
	return new ChatAppImpl(brainApp, memoryApp);
};
