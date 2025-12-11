import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import posthog from 'posthog-js';

export const handlePostHog: Handle = async ({ event, resolve }) => {
	posthog.init(env.PUBLIC_POSTHOG_TOKEN, {
		api_host: env.PUBLIC_POSTHOG_HOST,
		defaults: '2025-11-30'
	});

	return resolve(event);
};
