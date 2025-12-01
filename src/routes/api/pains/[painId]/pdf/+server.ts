import { error, type RequestHandler } from '@sveltejs/kit';

import { withTracing } from '$lib/shared/server';

const handler: RequestHandler = async ({ params, locals, request }) => {
	const { painId } = params;
	const body = await request.json();
	const { chatId } = body;

	if (!locals.principal?.user) throw error(401, 'Unauthorized');
	if (!painId) throw error(400, 'Missing required parameters');

	const edge = locals.di.edge;

	const result = await edge.genPainPdf({
		principal: locals.principal,
		painId,
		chatId
	});
	return new Response(JSON.stringify(result), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

export const POST = withTracing(handler, {
	traceName: 'generate-pain-pdf',
	updateTrace: ({ params, locals }) => ({
		userId: locals.principal?.user?.id,
		sessionId: params.painId,
		metadata: {
			painId: params.painId
		}
	})
});
