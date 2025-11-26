import { ChatsStatusOptions, Collections, pb, type ChatsResponse } from '$lib';

class ChatsStore {
	_chats: ChatsResponse[] = $state([]);

	chats = $derived(this._chats);

	set(chats: ChatsResponse[]) {
		this._chats = chats;
	}

	getEmpty() {
		return this._chats.find((chat) => chat.status === ChatsStatusOptions.empty);
	}

	async subscribe(userId: string) {
		return pb.collection(Collections.Chats).subscribe(
			'*',
			(e) => {
				switch (e.action) {
					case 'create':
						this._chats = this._chats.filter((item) => !item.id.startsWith('temp-'));
						this._chats.unshift(e.record);
						break;
					case 'update':
						this._chats = this._chats.map((item) => (item.id === e.record.id ? e.record : item));
						break;
					case 'delete':
						this._chats = this._chats.filter((item) => item.id !== e.record.id);
						break;
				}
			},
			{ filter: `user = "${userId}"` }
		);
	}

	unsubscribe() {
		pb.collection(Collections.Chats).unsubscribe();
	}
}

export const chatsStore = new ChatsStore();
