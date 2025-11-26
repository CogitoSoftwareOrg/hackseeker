import { Collections, pb, type PainsResponse } from '$lib';

class PainsStore {
	_pains: PainsResponse[] = $state([]);

	pains = $derived(this._pains);

	set(pains: PainsResponse[]) {
		this._pains = pains;
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
