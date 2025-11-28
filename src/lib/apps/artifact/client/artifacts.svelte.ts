import { Collections, pb, type ArtifactsResponse } from '$lib';

class ArtifactsStore {
	_artifacts: ArtifactsResponse[] = $state([]);

	artifacts = $derived(this._artifacts);

	set(artifacts: ArtifactsResponse[]) {
		this._artifacts = artifacts;
	}

	getByPainId(painId: string) {
		return this._artifacts.filter((a) => a.pain === painId);
	}

	getBySearchQueryId(searchQueryId: string) {
		return this._artifacts.filter((a) => a.searchQuery === searchQueryId);
	}

	async loadByPainId(painId: string) {
		const artifacts = await pb.collection(Collections.Artifacts).getFullList({
			filter: `pain = "${painId}"`,
			sort: '-created'
		});
		this._artifacts = [...this._artifacts.filter((a) => a.pain !== painId), ...artifacts];
		return artifacts;
	}

	async subscribe(painId: string) {
		return pb.collection(Collections.Artifacts).subscribe(
			'*',
			(e) => {
				switch (e.action) {
					case 'create':
						this._artifacts.unshift(e.record);
						break;
					case 'update':
						this._artifacts = this._artifacts.map((item) =>
							item.id === e.record.id ? e.record : item
						);
						break;
					case 'delete':
						this._artifacts = this._artifacts.filter((item) => item.id !== e.record.id);
						break;
				}
			},
			{ filter: `pain = "${painId}"` }
		);
	}

	unsubscribe() {
		pb.collection(Collections.Artifacts).unsubscribe();
	}
}

export const artifactsStore = new ArtifactsStore();
