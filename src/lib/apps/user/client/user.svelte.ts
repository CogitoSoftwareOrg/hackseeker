import type { AuthRecord } from 'pocketbase';

import { pb, type UsersResponse } from '$lib';
import type { Sender } from '$lib/apps/chat/core';

class UserStore {
	user: UsersResponse<unknown> | null = $state(null);
	token: string | null = $state(null);

	avatarUrl = $derived(this.user?.avatar ? pb?.files.getURL(this.user, this.user.avatar) : null);

	sender: Sender = $derived({
		id: this.user?.id || '',
		avatar: this.avatarUrl || '',
		name: this.user?.name || 'Name',
		role: 'user'
	});

	async subscribe(userId: string) {
		return pb!.collection('users').subscribe(userId, (e) => {
			switch (e.action) {
				case 'update':
					pb!.authStore.save(pb!.authStore.token, e.record as AuthRecord);
					break;
				case 'delete':
					pb!.authStore.clear();
					break;
			}
		});
	}

	unsubscribe() {
		pb!.collection('users').unsubscribe();
	}
}

export const userStore = new UserStore();
