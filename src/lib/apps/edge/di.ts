import type { UserApp } from '$lib/apps/user/core';
import type { ChatApp } from '$lib/apps/chat/core';
import type { PainApp } from '$lib/apps/pain/core';

import { EdgeAppImpl } from './app';

export const getEdgeApp = (userApp: UserApp, chatApp: ChatApp, painApp: PainApp) => {
	return new EdgeAppImpl(userApp, chatApp, painApp);
};
