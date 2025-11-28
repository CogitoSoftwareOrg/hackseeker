import type { MemoryApp } from '$lib/apps/memory/core';
import type { PainApp } from '$lib/apps/pain/core';

import { ChatAppImpl } from './app';

export const getChatApp = (memoryApp: MemoryApp, painApp: PainApp) => {
	return new ChatAppImpl(memoryApp, painApp);
};
