import type { UserApp } from '$lib/apps/user/core';
import type { ChatApp } from '$lib/apps/chat/core';

import { EdgeAppImpl } from './app';

export const getEdgeApp = (userApp: UserApp, chatApp: ChatApp) => {
	return new EdgeAppImpl(userApp, chatApp);
};
