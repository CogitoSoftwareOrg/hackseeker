import { Collections, pb } from '$lib';

export const load = async ({ params }) => {
	const { slugOrId } = params;
	const pain = await pb.collection(Collections.Pains).getOne(slugOrId);
	const htmlUrl = pb.files.getURL(pain, pain.landing);
	const htmlContent = await fetch(htmlUrl).then((res) => res.text());
	console.log('htmlContent', htmlContent);
	return { htmlContent, painId: pain.id };
};
