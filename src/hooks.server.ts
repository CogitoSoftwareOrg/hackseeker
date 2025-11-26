import '$lib/shared/server/instrumentation';
import '$lib/shared/server/tg';

import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { env } from '$env/dynamic/private';

import { Collections, pb } from '$lib';
import { startWorker } from '$lib/apps/job/worker';
import { getDI } from '$lib/shared/server';

const handleLogger: Handle = async ({ event, resolve }) => {
	console.log(event.request.method, event.url.pathname);
	return resolve(event);
};

const handleAdminPocketbase: Handle = async ({ event, resolve }) => {
	if (pb.authStore.isValid) return resolve(event);

	try {
		await pb.collection(Collections.Superusers).authWithPassword(env.PB_EMAIL, env.PB_PASSWORD);
	} catch (error) {
		console.error(error, 'Failed to authenticate admin user! Oh no!');
	}
	return resolve(event);
};

const handleUserAuth: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('pb_token');
	if (!token) return resolve(event);

	event.locals.di = getDI();

	try {
		const principal = await event.locals.di.user.auth({ token });
		event.locals.principal = principal;
	} catch (error) {
		console.warn(error);
	}
	return resolve(event);
};

startWorker();
export const handle = sequence(handleLogger, handleAdminPocketbase, handleUserAuth);
