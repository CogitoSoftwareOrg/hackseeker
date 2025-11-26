import { VoyageAIClient } from 'voyageai';
import { env } from '$env/dynamic/private';

export const voyage = new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY });
