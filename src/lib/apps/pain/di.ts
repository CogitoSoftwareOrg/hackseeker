import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { SearchApp } from '$lib/apps/search/core';

import { PainAppImpl } from './app';
import type { PainApp } from './core';

export const getPainApp = (searchApp: SearchApp, artifactApp: ArtifactApp): PainApp => {
	const painApp = new PainAppImpl(searchApp, artifactApp);
	return painApp;
};
