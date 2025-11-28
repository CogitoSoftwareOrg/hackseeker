import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { SearchApp } from '$lib/apps/search/core';
import type { MemoryApp } from '$lib/apps/memory/core';
import type { ChatApp } from '$lib/apps/chat/core';

import { DiscoveryAgent, ValidationAgent, PdfRenderer, PdfAgent, LandingAgent } from './adapters';
import { PainAppImpl } from './app';
import type { PainApp } from './core';

export const getPainApp = (
	searchApp: SearchApp,
	artifactApp: ArtifactApp,
	memoryApp: MemoryApp,
	chatApp: ChatApp
): PainApp => {
	const discoveryAgent = new DiscoveryAgent([memoryApp.searchTool, memoryApp.putTool]);
	const validationAgent = new ValidationAgent([memoryApp.searchTool, memoryApp.putTool]);
	const pdfAgent = new PdfAgent([memoryApp.searchTool, memoryApp.putTool]);
	const landingAgent = new LandingAgent([memoryApp.searchTool, memoryApp.putTool]);

	const pdfRenderer = new PdfRenderer();

	const painApp = new PainAppImpl(
		{
			discovery: discoveryAgent,
			validation: validationAgent,
			pdf: pdfAgent,
			landing: landingAgent
		},
		pdfRenderer,
		searchApp,
		chatApp,
		artifactApp,
		memoryApp
	);
	return painApp;
};
