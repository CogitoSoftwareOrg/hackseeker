import { Collections, pb, type SearchQueriesResponse } from '$lib';

class SearchQueriesStore {
	_queries: SearchQueriesResponse[] = $state([]);

	queries = $derived(this._queries);

	set(queries: SearchQueriesResponse[]) {
		this._queries = queries;
	}

	getByPainId(painId: string) {
		return this._queries.filter((q) => q.pain === painId);
	}

	async loadByPainId(painId: string) {
		const queries = await pb.collection(Collections.SearchQueries).getFullList({
			filter: `pain = "${painId}"`,
			sort: '-created'
		});
		this._queries = [...this._queries.filter((q) => q.pain !== painId), ...queries];
		return queries;
	}

	async subscribe(painId: string) {
		return pb.collection(Collections.SearchQueries).subscribe(
			'*',
			(e) => {
				switch (e.action) {
					case 'create':
						this._queries.unshift(e.record);
						break;
					case 'update':
						this._queries = this._queries.map((item) =>
							item.id === e.record.id ? e.record : item
						);
						break;
					case 'delete':
						this._queries = this._queries.filter((item) => item.id !== e.record.id);
						break;
				}
			},
			{ filter: `pain = "${painId}"` }
		);
	}

	unsubscribe() {
		this._queries = [];
		pb.collection(Collections.SearchQueries).unsubscribe();
	}
}

export const searchQueriesStore = new SearchQueriesStore();
