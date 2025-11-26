import { env } from '$env/dynamic/private';
import Firecrawl from '@mendable/firecrawl-js';

export const firecrawl = new Firecrawl({ apiKey: env.FIRECRAWL_API_KEY });
