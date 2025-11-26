import { globalUserLoad } from '$lib/apps/user/client';

export async function load({ depends }) {
	depends('app:global');

	const globalPromise = globalUserLoad();
	return { globalPromise };
}
