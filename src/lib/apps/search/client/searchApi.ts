import { Collections, pb } from '$lib/shared';

class SearchApi {
	async search(queryId: string) {
		const response = await fetch(`/api/search`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ queryIds: [queryId] })
		});
		return response.json();
	}

	async update(queryId: string, data: { query?: string; site?: string }) {
		return pb.collection(Collections.SearchQueries).update(queryId, data);
	}
}

export const searchApi = new SearchApi();
