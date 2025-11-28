import type { UserApp } from '$lib/apps/user/core';
import type { PainApp } from '$lib/apps/pain/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';

import { EdgeAppImpl } from './app';
import type { EdgeApp } from './core';

export const getEdgeApp = (
	userApp: UserApp,
	painApp: PainApp,
	artifactApp: ArtifactApp
): EdgeApp => {
	return new EdgeAppImpl(userApp, painApp, artifactApp);
};
