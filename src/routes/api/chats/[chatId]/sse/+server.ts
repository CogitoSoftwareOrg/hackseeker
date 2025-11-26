import { error, type RequestHandler } from '@sveltejs/kit';

import { withTracing, streamWithFlush } from '$lib/shared/server';

const handler: RequestHandler = async ({ params, url, locals }) => {
	const { chatId } = params;
	const query = url.searchParams.get('q') || '';

	if (!locals.principal?.user) throw error(401, 'Unauthorized');
	if (!chatId) throw error(400, 'Missing required parameters');

	const edge = locals.di.edge;

	const stream = await edge.streamChat({
		principal: locals.principal,
		chatId,
		query
	});
	return new Response(streamWithFlush(stream), {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};

export const GET = withTracing(handler, {
	traceName: 'chat-sse',
	updateTrace: ({ params, locals }) => ({
		userId: locals.principal?.user?.id,
		sessionId: params.chatId,
		metadata: {
			chatId: params.chatId
		}
	})
});
