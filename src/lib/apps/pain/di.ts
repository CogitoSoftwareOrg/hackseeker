import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { SearchApp } from '$lib/apps/search/core';
import type { ChatApp } from '$lib/apps/chat/core';
import type { UserApp } from '$lib/apps/user/core';

import { DiscoveryAgent, ValidationAgent, PdfRenderer, PdfAgent, LandingAgent } from './adapters';
import { PainAppImpl } from './app';
import type { PainApp } from './core';

export const getPainApp = (
	searchApp: SearchApp,
	artifactApp: ArtifactApp,
	chatApp: ChatApp,
	userApp: UserApp
): PainApp => {
	const discoveryAgent = new DiscoveryAgent([]);
	const validationAgent = new ValidationAgent([]);
	const pdfAgent = new PdfAgent([]);
	const landingAgent = new LandingAgent([]);

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
		userApp
	);
	return painApp;
};
