import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { SearchApp } from '$lib/apps/search/core';
import type { MemoryApp } from '$lib/apps/memory/core';

import { DiscoveryAgent, ValidationAgent } from './adapters';
import { PainAppImpl } from './app';
import type { PainApp } from './core';

export const getPainApp = (
	searchApp: SearchApp,
	artifactApp: ArtifactApp,
	memoryApp: MemoryApp
): PainApp => {
	const discoveryAgent = new DiscoveryAgent(memoryApp, []);
	const validationAgent = new ValidationAgent(memoryApp, []);

	const painApp = new PainAppImpl(
		{ discovery: discoveryAgent, validation: validationAgent },
		searchApp,
		artifactApp
	);
	return painApp;
};
