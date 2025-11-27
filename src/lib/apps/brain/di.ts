import type { MemoryApp } from '$lib/apps/memory/core';
import type { PainApp } from '$lib/apps/pain/core';

import { BrainAppImpl } from './app';
import { DiscoveryAgent, ValidationAgent } from './adapters';
import type { BrainApp } from './core';

export const getBrainApp = (memoryApp: MemoryApp, painApp: PainApp): BrainApp => {
	const discoveryAgent = new DiscoveryAgent(memoryApp, painApp);
	const validationAgent = new ValidationAgent(memoryApp, painApp);

	return new BrainAppImpl({
		discovery: discoveryAgent,
		validation: validationAgent
	});
};
