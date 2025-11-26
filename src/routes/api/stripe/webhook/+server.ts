import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe, getPriceByLookup } from '$lib/shared/server';
import { env } from '$env/dynamic/private';
import { pb, Collections } from '$lib';
import type { SubsRecord } from '$lib/shared/pb/pocketbase-types';
import Stripe from 'stripe';

function toPbDate(ts: number | null | undefined): string {
	if (!ts) return '';
	return new Date(ts * 1000).toISOString().replace('T', ' ').replace('Z', '');
}

async function stripeSubscriptionToPb(sub: Stripe.Subscription, userId?: string) {
	const stripeSubscriptionId = sub.id;
	const status = sub.status;
	const item = sub.items.data[0];
	const priceId = item.price.id;
	const product = item.price.product as string;
	const interval = item.price.recurring?.interval;

	const cpStart = (sub as any).current_period_start;
	const cpEnd = (sub as any).current_period_end;

	// Find existing sub
	// We need to find by stripeSubscription OR user
	// If userId is provided (from checkout session), we can search by user.
	// Otherwise search by stripeSubscription.
	let existingSub: any = null;

	try {
		if (userId) {
			existingSub = await pb.collection(Collections.Subs).getFirstListItem(`user = "${userId}"`);
		} else {
			existingSub = await pb
				.collection(Collections.Subs)
				.getFirstListItem(`stripeSub = "${stripeSubscriptionId}"`);
		}
	} catch (e) {
		// Not found
	}

	// If not found and no userId, we can't link it?
	// Actually, if we have stripeCustomer, we might find the user via that?
	// But usually we rely on the initial checkout to link user <-> sub.
	// If existingSub is null and userId is null, we might have a problem if it's a pure webhook update for a sub we don't know.
	// But we should know it from checkout.

	if (!existingSub && !userId) {
		console.error('Could not find subscription or user for update', stripeSubscriptionId);
		return;
	}

	// Get Price details
	// We need to find the price object to get tariff and limits.
	// In legacy, we had a map.
	// We can try to find it in our map or fetch it.
	// For now, let's assume we can get it from the price object if we expand it, or just map it.
	// Since we don't have the full map populated, we might need to rely on lookup_key if available.
	// The `sub` object might not have price expanded with lookup_key.
	// We might need to fetch the price.

	let tariff = 'free';
	let limits = { quizItemsLimit: 0, storageLimit: 0 };

	// Try to fetch price details to get lookup key
	try {
		const priceObj = await stripe.prices.retrieve(priceId);
		if (priceObj.lookup_key) {
			const p = await getPriceByLookup(priceObj.lookup_key);
			if (p) {
				tariff = p.tariff;
				limits = p.limits;
			}
		}
	} catch (e) {
		console.error('Error fetching price details', e);
	}

	const recordData: Partial<SubsRecord> = {
		stripeSub: stripeSubscriptionId,
		stripeCustomer: sub.customer as string,
		status: status as any, // Map to enum if needed, but strings usually match
		stripeProduct: product,
		stripePrice: priceId,
		tariff: tariff as any,
		// stripeInterval: interval, // Not in SubsRecord?
		currentPeriodStart: toPbDate(cpStart),
		currentPeriodEnd: toPbDate(cpEnd)
		// cancelAtPeriodEnd: sub.cancel_at_period_end, // Not in SubsRecord?
		// metadata: sub.metadata // Not in SubsRecord?
	};

	// Update limits
	if (limits) {
		// We might want to update limits only if they changed?
		// Or just always overwrite.
		// SubsRecord has pointsLimit?
		// The user provided types: pointsLimit, pointsUsage.
		// Wait, the user types show `pointsLimit`.
		// My `limits` interface has `quizItemsLimit` and `storageLimit`.
		// The user types don't show `quizItemsLimit` or `storageLimit` in `SubsRecord`?
		// Let's check `pocketbase-types.ts` again.
		// `SubsRecord`: pointsLimit, pointsUsage, status, stripeCustomer, stripePrice, stripeProduct, stripeSub, tariff, user.
		// It does NOT have `quizItemsLimit` or `storageLimit`.
		// The legacy code had `quizItemsLimit` and `storageLimit` in `Limits` dataclass, and updated them in `subscriptions` collection.
		// Maybe the schema changed?
		// The user said: "У меня сейчас 1 платный tariff plus (лимит 1К можешь пока что поставить) и платная покупка "bundle" которая допустим вычитает usage (пока так)"
		// "limit 1K" probably refers to `pointsLimit`.
		// So `quizItemsLimit` -> `pointsLimit`.
		// What about `storageLimit`?
		// The user types don't show it. Maybe it's not in `SubsRecord` yet?
		// Or maybe I missed it.
		// Let's check `pocketbase-types.ts` content again.
		// Line 219: `SubsRecord`
		// 225: `pointsLimit?: number`
		// 226: `pointsUsage?: number`
		// No `storageLimit`.
		// The user's legacy code had `storageLimit`.
		// I will assume `pointsLimit` is what we want to update.
		// And I will ignore `storageLimit` for now if it's not in the types, or maybe I should check if I can add it?
		// No, I should stick to the types.
		// I will map `quizItemsLimit` (1000/2000) to `pointsLimit`.

		if (limits.quizItemsLimit) {
			recordData.pointsLimit = limits.quizItemsLimit;
		}
	}

	// Handle usage reset
	// Legacy: _maybe_reset_usage_on_period_change
	if (existingSub) {
		const lastReset = existingSub.lastUsageResetAt
			? new Date(existingSub.lastUsageResetAt).getTime() / 1000
			: 0;
		const prevCpStart = existingSub.currentPeriodStart
			? new Date(existingSub.currentPeriodStart).getTime() / 1000
			: 0;

		// If new period start > prev period start
		// And we haven't reset for this new period (lastReset < newCpStart)
		if (cpStart > prevCpStart && lastReset < cpStart) {
			recordData.pointsUsage = 0;
			recordData.lastUsageResetAt = toPbDate(Date.now() / 1000);
		}

		await pb.collection(Collections.Subs).update(existingSub.id, recordData);
	} else if (userId) {
		// Create new sub?
		// But we usually have a sub record created when user registers?
		// If not, create it.
		recordData.user = userId;
		recordData.pointsUsage = 0;
		recordData.lastUsageResetAt = toPbDate(Date.now() / 1000);
		await pb.collection(Collections.Subs).create(recordData);
	}
}

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.text();
	const sig = request.headers.get('stripe-signature');

	if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
		error(400, 'Missing signature or secret');
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
	} catch (err: any) {
		console.error('Webhook signature verification failed', err.message);
		error(400, `Webhook Error: ${err.message}`);
	}

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				const userId = session.metadata?.user_id || session.client_reference_id;

				if (session.mode === 'subscription') {
					const subscriptionId = session.subscription as string;
					const sub = await stripe.subscriptions.retrieve(subscriptionId);
					await stripeSubscriptionToPb(sub, userId || undefined);
				} else if (session.mode === 'payment' && session.metadata?.type === 'bundle') {
					// Handle bundle
					// "вычитает usage" -> subtract from pointsUsage
					// Assume bundle size is 1000 for now or derive from price?
					// Let's assume 1000.
					const bundleSize = 1000;
					if (userId) {
						// Find sub
						try {
							const sub = await pb
								.collection(Collections.Subs)
								.getFirstListItem(`user = "${userId}"`);
							const currentUsage = sub.pointsUsage || 0;
							await pb.collection(Collections.Subs).update(sub.id, {
								pointsUsage: Math.max(0, currentUsage - bundleSize) // Ensure not negative? Or allow negative?
								// User said "вычитает usage".
							});
						} catch (e) {
							console.error('Error updating bundle usage', e);
						}
					}
				}
				break;
			}
			case 'customer.subscription.created':
			case 'customer.subscription.updated':
			case 'customer.subscription.deleted': {
				const sub = event.data.object as Stripe.Subscription;
				await stripeSubscriptionToPb(sub);
				break;
			}
			case 'invoice.payment_succeeded':
			case 'invoice.payment_failed': {
				const invoice = event.data.object as any;
				if (invoice.subscription) {
					const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
					await stripeSubscriptionToPb(sub);
				}
				break;
			}
		}
	} catch (err: unknown) {
		console.error('Error processing webhook', err instanceof Error ? err.message : 'Unknown error');
		error(500, 'Server Error');
	}

	return json({ received: true });
};
