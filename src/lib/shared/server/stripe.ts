import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

export const stripe = new Stripe(env.STRIPE_API_KEY, {
	apiVersion: '2025-11-17.clover'
});

export const STRIPE_LOOKUPS = ['plus_early_monthly', 'plus_early_yearly', 'bundle_1000'];

export interface Limits {
	quizItemsLimit: number;
	storageLimit: number;
}

export interface Price {
	id: string;
	lookup: string;
	tariff: string;
	limits: Limits;
}

// This will be populated at runtime or we can hardcode if we know them.
// For now, let's keep the logic to fetch or just hardcode for the known ones if easier,
// but the legacy code fetched them. To avoid async top-level await issues in some environments,
// we might want to fetch them on demand or cache them.
// However, for simplicity and performance, hardcoding the mapping based on lookups
// or fetching once is better.
// Let's stick to a simple map for now that we might populate or just use lookups directly.

export const PRICES_MAP: Record<string, Price> = {};

// Helper to get price by lookup
export async function getPriceByLookup(lookup: string): Promise<Price | null> {
	// In a real app, you might want to cache this
	const prices = await stripe.prices.list({
		lookup_keys: [lookup],
		expand: ['data.product']
	});

	if (prices.data.length === 0) return null;

	const price = prices.data[0];
	const tariff = lookup.split('_')[0];

	return {
		id: price.id,
		lookup: lookup,
		tariff: tariff,
		limits: {
			quizItemsLimit: tariff === 'plus' ? 1000 : 2000,
			storageLimit: tariff === 'plus' ? 10 * 1024 * 1024 * 1024 : 100 * 1024 * 1024 * 1024
		}
	};
}
