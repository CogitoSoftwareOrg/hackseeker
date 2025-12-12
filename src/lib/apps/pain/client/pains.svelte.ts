import { Collections, pb, type PainsResponse } from '$lib';

const PAGE_SIZE = 200;

class PainsStore {
	loading = $state(true);
	page = $state(1);
	totalPages = $state(0);
	totalItems = $state(0);

	private userId: string | null = null;

	private _pains: PainsResponse[] = $state([]);
	pains = $derived(this._pains);

	set(pains: PainsResponse[], page: number, totalPages: number, totalItems: number) {
		this.loading = false;
		this._pains = pains;
		this.page = page;
		this.totalPages = totalPages;
		this.totalItems = totalItems;
	}

	async load(userId: string) {
		const res = await pb.collection(Collections.Pains).getList(1, PAGE_SIZE, {
			filter: `user = "${userId}"`,
			sort: '-created'
		});
		this.userId = userId;
		return res;
	}

	getByChatId(chatId: string) {
		return this._pains.filter((pain) => pain.chats.some((chat) => chat === chatId));
	}

	async subscribe(userId: string) {
		return pb.collection(Collections.Pains).subscribe(
			'*',
			(e) => {
				switch (e.action) {
					case 'create':
						this._pains = this._pains.filter((item) => !item.id.startsWith('temp-'));
						this._pains.unshift(e.record);
						break;
					case 'update':
						this._pains = this._pains.map((item) => (item.id === e.record.id ? e.record : item));
						break;
					case 'delete':
						this._pains = this._pains.filter((item) => item.id !== e.record.id);
						break;
				}
			},
			{ filter: `user = "${userId}"` }
		);
	}

	unsubscribe() {
		pb.collection(Collections.Pains).unsubscribe();
	}
}

export const painsStore = new PainsStore();
