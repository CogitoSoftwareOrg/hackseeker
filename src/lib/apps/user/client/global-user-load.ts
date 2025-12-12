import { pb, type UsersResponse, type UserExpand, Collections } from '$lib';
import { chatsStore } from '$lib/apps/chat/client';
import { painsStore } from '$lib/apps/pain/client';

export async function globalUserLoad() {
	console.log('globalUserLoad', pb.authStore.isValid);
	if (!pb.authStore.isValid) {
		return { user: null, sub: null, chatsRes: null, painsRes: null };
	}

	try {
		const res = await pb.collection(Collections.Users).authRefresh({ expand: 'subs_via_user' });
		const user = res.record as UsersResponse<UserExpand>;
		const sub = user.expand?.subs_via_user?.at(0) ?? null;

		const chatsRes = await chatsStore.load(user.id);
		const painsRes = await painsStore.load(user.id);

		return { user, sub, chatsRes, painsRes };
	} catch (error) {
		console.error(error, 'Failed to refresh user data!');
		pb.authStore.clear();
		return { user: null, sub: null, chatsRes: null, painsRes: null };
	}
}
