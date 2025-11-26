import { withTracing } from '$lib/shared/server';
import type { RequestHandler } from '@sveltejs/kit';

const handler: RequestHandler = async ({ request }) => {
	const update = JSON.parse(await request.text());
	return new Response(JSON.stringify(update), { status: 200 });
};

export const POST = withTracing(handler, {
	traceName: 'tg-webhook-friend',
	updateTrace: ({ params, locals }) => {
		return {
			userId: locals.user?.id,
			sessionId: params.chatId,
			metadata: {
				storyId: params.storyId,
				eventId: params.eventId,
				chatId: params.chatId
			}
		};
	}
});
