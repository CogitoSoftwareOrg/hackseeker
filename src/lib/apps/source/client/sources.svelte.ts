import { Collections, pb, SourcesStatusOptions, type Create, type SourcesResponse } from '$lib';

class SourcesStore {
	_sources: SourcesResponse[] = $state([]);

	set(sources: SourcesResponse[]) {
		this._sources = sources;
	}

	sources = $derived(this._sources);

	addOptimistic(dto: Create<Collections.Sources>) {
		const source = {
			id: `temp-${Date.now()}`,
			...dto,
			status: SourcesStatusOptions.optimistic
		} as unknown as SourcesResponse;
		this._sources = [source, ...this._sources];
	}

	async subscribe(userId: string) {
		return pb.collection(Collections.Sources).subscribe(
			'*',
			(e) => {
				switch (e.action) {
					case 'create':
						this._sources = this._sources.filter((item) => !item.id.startsWith('temp-'));
						this._sources.unshift(e.record);
						break;
					case 'update':
						this._sources = this._sources.map((item) =>
							item.id === e.record.id ? e.record : item
						);
						break;
					case 'delete':
						this._sources = this._sources.filter((item) => item.id !== e.record.id);
						break;
				}
			},
			{ filter: `user = "${userId}"` }
		);
	}

	unsubscribe() {
		pb.collection(Collections.Sources).unsubscribe();
	}
}

export const sourcesStore = new SourcesStore();
