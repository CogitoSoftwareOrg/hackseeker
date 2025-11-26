import type { AuthRecord } from 'pocketbase';

import { subStore, userStore } from '$lib/apps/user/client';
import { chatsStore, messagesStore } from '$lib/apps/chat/client';
import { pb, setPBCookie, uiStore, type UsersResponse } from '$lib';

pb.authStore.onChange((token: string, record: AuthRecord) => {
	if (record && pb!.authStore.isValid) {
		try {
			const user = record as UsersResponse;
			userStore.user = user;
			userStore.token = token;

			setPBCookie();
		} catch (error) {
			console.error('Failed to parse user data:', error);
		}
	} else {
		userStore.user = null;
		userStore.token = null;
		uiStore.clear();
		userStore.user = null;
		userStore.token = null;
		subStore.sub = null;
		chatsStore.set([]);
		messagesStore.set([]);
	}
}, false);
