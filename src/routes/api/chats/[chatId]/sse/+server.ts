import { error, type RequestHandler } from '@sveltejs/kit';

import { withTracing, streamWithFlush } from '$lib/shared/server';
import type { WorkflowMode } from '$lib/apps/pain/core';

const handler: RequestHandler = async ({ params, url, locals }) => {
	const { chatId } = params;
	const mode = (url.searchParams.get('mode') as WorkflowMode) ?? 'discovery';

	const query = url.searchParams.get('q') || '';

	if (!locals.principal?.user) throw error(401, 'Unauthorized');
	if (!chatId) throw error(400, 'Missing required parameters');

	const edge = locals.di.edge;

	const sendEvent = (event: string, data: string) => {
		controller.enqueue(encoder.encode(`event: ${event}\n`));
		controller.enqueue(encoder.encode(`data: ${data}\n\n`));
	};

	const stream = await edge.streamChat({
		mode,
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
