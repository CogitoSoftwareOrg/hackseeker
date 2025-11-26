import OpenAI from 'openai';
import { observeOpenAI } from '@langfuse/openai';

import { env } from '$env/dynamic/private';

export const openai = observeOpenAI(
	new OpenAI({
		apiKey: env.OPENAI_API_KEY
	})
);

export const grok = observeOpenAI(
	new OpenAI({
		baseURL: 'https://api.x.ai/v1',
		apiKey: env.GROK_API_KEY
	})
);
