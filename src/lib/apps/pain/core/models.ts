import type { PainsResponse } from '$lib/shared';

export type PainKeywords = string[];
export type PainMetrics = Record<string, number>;

export type WorkflowMode = 'discovery' | 'validation';

export class Pain {
	constructor(
		public readonly data: PainsResponse,
		public prompt: string
	) {}

	static fromResponse(res: PainsResponse<PainKeywords, PainMetrics>): Pain {
		const prompt = `
Pain id: ${res.id}
Pain status: ${res.status}
Pain segment: ${res.segment}
Pain problem: ${res.problem}
Pain job to be done: ${res.jtbd}
Pain keywords: ${res.keywords?.join(', ')}
Pain metrics:
${Object.entries(res.metrics ?? {})
	.map(([key, value]) => `${key}: ${value}`)
	.join(', ')}
Pain created: ${res.created}
Pain updated: ${res.updated}
`;
		return new Pain(res, prompt);
	}
}
