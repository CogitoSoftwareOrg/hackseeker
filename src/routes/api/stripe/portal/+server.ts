import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/shared/server';
import { env } from '$env/dynamic/public';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.principal) error(401, 'Unauthorized');

	const { returnUrl } = await request.json();
	const sub = locals.principal.sub;

	if (!sub || !sub.stripeCustomer) error(400, 'No Stripe customer found');

	try {
		const portal = await stripe.billingPortal.sessions.create({
			customer: sub.stripeCustomer,
			return_url: `${env.PUBLIC_APP_URL}${returnUrl}`
		});
		return json({ url: portal.url });
	} catch (err: unknown) {
		console.error('Stripe portal error:', err);
		error(400, `Stripe error: ${err instanceof Error ? err.message : 'Unknown error'}`);
	}
};
