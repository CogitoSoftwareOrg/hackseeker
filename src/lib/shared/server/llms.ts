import { encoding_for_model } from 'tiktoken';

export const LLMS = {
	GROK_4_FAST_NON_REASONING: 'grok-4-fast-non-reasoning',
	GROK_4_FAST: 'grok-4-fast',
	GROK_4_1_FAST: 'grok-4-1-fast-reasoning',
	GROK_4_1_FAST_NON_REASONING: 'grok-4-1-fast-non-reasoning'
} as const;

export const TOKENIZERS = {
	[LLMS.GROK_4_FAST_NON_REASONING]: encoding_for_model('gpt-4o-mini'),
	[LLMS.GROK_4_FAST]: encoding_for_model('gpt-4o-mini')
};

export const EMBEDDERS = {
	VOYAGE_LITE: 'voyage-3.5-lite'
};
