import { error } from '@sveltejs/kit';
import { startActiveObservation, propagateAttributes } from '@langfuse/tracing';

export const POST = async ({ locals, request }) => {
	const { principal } = locals;
	if (!principal?.user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const { queryIds, painId } = body;

	const edge = locals.di.edge;

	return await startActiveObservation('search-artifacts', async () => {
		return await propagateAttributes(
			{
				userId: principal.user.id,
				sessionId: undefined
			},
			async () => {
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
			}
		);
	});
};
