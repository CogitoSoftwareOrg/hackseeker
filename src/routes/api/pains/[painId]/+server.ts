import { error } from '@sveltejs/kit';

export const PUT = async ({ params, locals, request }) => {
	const { painId } = params;
	const body = await request.json();
	const { chatId } = body;

	if (!locals.principal?.user) throw error(401, 'Unauthorized');
	if (!painId) throw error(400, 'Missing required parameters');
	if (!chatId) throw error(400, 'Missing required parameters');

	const edge = locals.di.edge;

	const result = await edge.startPainValidation({
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
