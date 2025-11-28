import { error, type RequestHandler } from '@sveltejs/kit';

import { withTracing } from '$lib/shared/server';

const handler: RequestHandler = async ({ params, locals }) => {
	const { painId } = params;

	if (!locals.principal?.user) throw error(401, 'Unauthorized');
	if (!painId) throw error(400, 'Missing required parameters');

	const edge = locals.di.edge;

	const result = await edge.genPainLanding({
		principal: locals.principal,
		painId
	});
	return new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

export const POST = withTracing(handler, {
	traceName: 'generate-pain-landing',
	updateTrace: ({ params, locals }) => ({
		userId: locals.principal?.user?.id,
		sessionId: params.painId,
		metadata: {
			painId: params.painId
		}
	})
});
