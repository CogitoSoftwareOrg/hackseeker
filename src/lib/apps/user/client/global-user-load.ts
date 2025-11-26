import { pb, type UsersResponse, type UserExpand, Collections } from '$lib';

export async function globalUserLoad() {
	console.log('globalUserLoad', pb.authStore.isValid);
	if (!pb.authStore.isValid) {
		return { user: null, sub: null, chats: [], pains: [] };
	}

	const res = await pb.collection(Collections.Users).authRefresh({ expand: 'subs_via_user' });
	const user = res.record as UsersResponse<UserExpand>;
	const sub = user.expand?.subs_via_user?.at(0) ?? null;

	const chats = await pb.collection(Collections.Chats).getFullList({
		filter: `user = "${user.id}"`,
		sort: '-created'
	});
	const pains = await pb.collection(Collections.Pains).getFullList({
		filter: `user = "${user.id}"`,
		sort: '-created'
	});

	return { user, sub, chats, pains };
}
