import { error, type RequestHandler } from '@sveltejs/kit';

import { withTracing } from '$lib/shared/server';

const handler: RequestHandler = async ({ locals, request }) => {
	const { principal } = locals;
	if (!principal?.user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const { queryIds, painId } = body;

	const edge = locals.di.edge;

	await edge.searchArtifacts({
		principal,
		painId,
		queryIds
	});

	return new Response(JSON.stringify({ success: true }), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

export const POST = withTracing(handler, {
	traceName: 'search-artifacts',
	updateTrace: ({ locals }) => ({
		userId: locals.principal?.user?.id,
		sessionId: undefined,
		metadata: {}
	})
});
