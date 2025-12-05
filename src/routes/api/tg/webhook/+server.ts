export const GET = async ({ request }) => {
	const update = JSON.parse(await request.text());
	return new Response(JSON.stringify(update), { status: 200 });
};
