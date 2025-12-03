import type { UserApp } from '$lib/apps/user/core';
import type { ChatApp } from '$lib/apps/chat/core';
import type { EdgeApp } from '$lib/apps/edge/core';
import type { JobApp } from '$lib/apps/job/core';
import type { PainApp } from '$lib/apps/pain/core';

import { getUserApp } from '$lib/apps/user/di';
import { getChatApp } from '$lib/apps/chat/di';
import { getEdgeApp } from '$lib/apps/edge/di';
import { getJobApp } from '$lib/apps/job/di';
import { getPainApp } from '$lib/apps/pain/di';
import { getSearchApp } from '$lib/apps/search/di';
import { getArtifactApp } from '$lib/apps/artifact/di';

export type DI = {
	user: UserApp;
	chat: ChatApp;
	edge: EdgeApp;
	job: JobApp;
	pain: PainApp;
};

let di: DI | null = null;

export const getDI = () => {
	if (di) return di;

	const searchApp = getSearchApp();

	const userApp = getUserApp();
	const chatApp = getChatApp();

	const artifactApp = getArtifactApp(searchApp);

	const painApp = getPainApp(searchApp, artifactApp, chatApp, userApp);

	const edgeApp = getEdgeApp(userApp, painApp, artifactApp);
	const jobApp = getJobApp();

	di = {
		user: userApp,
		chat: chatApp,
		edge: edgeApp,
		job: jobApp,
		pain: painApp
	};

	return di;
};
