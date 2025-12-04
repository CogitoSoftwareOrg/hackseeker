import { startActiveObservation, propagateAttributes } from '@langfuse/tracing';
import { error } from '@sveltejs/kit';

import { streamWithTracing } from '$lib/shared/server/tracing';
import type { AskMode } from '$lib/apps/pain/core';

export const GET = async ({ params, url, locals }) => {
	const { chatId } = params;
	const mode = (url.searchParams.get('mode') as AskMode) ?? 'discovery';

	const query = url.searchParams.get('q') || '';

	if (!locals.principal?.user) throw error(401, 'Unauthorized');
	if (!chatId) throw error(400, 'Missing required parameters');

	const edge = locals.di.edge;
	const principal = locals.principal;

	return await startActiveObservation('chat-sse', async () => {
		return await propagateAttributes(
			{
				userId: principal.user.id,
				sessionId: chatId,
				metadata: {
					chatId,
					mode,
					query
				}
			},
			async () => {
				const stream = await edge.streamChat({
					mode,
					principal,
					chatId,
					query
				});

				const wrappedStream = streamWithTracing(stream);

				return new Response(wrappedStream, {
					headers: {
						'Content-Type': 'text/event-stream',
						'Cache-Control': 'no-cache',
						Connection: 'keep-alive'
					}
				});
			}
		);
	});
};
