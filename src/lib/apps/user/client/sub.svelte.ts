import { Collections, pb, type SubsResponse } from '$lib';

class SubStore {
	sub: SubsResponse | null = $state(null);

	async subscribe(subId: string) {
		return pb!.collection(Collections.Subs).subscribe(subId, (e) => {
			const sub = e.record;
			switch (e.action) {
				case 'update':
					this.sub = sub;
					break;
			}
		});
	}

	unsubscribe() {
		pb!.collection(Collections.Subs).unsubscribe();
	}
}

export const subStore = new SubStore();
