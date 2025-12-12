import { Collections, MessagesStatusOptions, pb, type Create, type MessagesResponse } from '$lib';
import type { MessageChunk } from '$lib/apps/chat/core';

const PAGE_SIZE = 50;
class MessagesStore {
	loading = $state(true);
	page = $state(1);
	totalPages = $state(0);
	totalItems = $state(0);

	private chatId: string | null = null;
	private _messages: MessagesResponse[] = $state([]);
	messages = $derived(this._messages);

	set(messages: MessagesResponse[], page: number, totalPages: number, totalItems: number) {
		this.loading = false;

		this.page = page;
		this.totalPages = totalPages;
		this.totalItems = totalItems;
		this._messages = messages;
	}

	addChunk(chunk: MessageChunk) {
		const msg = this._messages.find((m) => m.id === chunk.msgId);
		if (!msg || msg.status !== 'streaming') return;

		// const nextI = chunk.i ?? ((msg as any)._last_i ?? 0) + 1;
		// if ((msg as any)._last_i && nextI <= (msg as any)._last_i) return;
		// (msg as any)._last_i = nextI;

		const newMsg = { ...msg, content: msg.content + chunk.text };
		this._messages = this._messages.map((m) => (m.id === msg.id ? newMsg : m));
	}

	async load(chatId: string) {
		const res = await pb.collection(Collections.Messages).getList(1, PAGE_SIZE, {
			filter: `chat = "${chatId}"`,
			sort: '-created'
		});
		res.items.reverse();

		this.chatId = chatId;
		return res;
	}

	async loadNextPage() {
		if (this.page >= this.totalPages) return;

		this.loading = true;
		const res = await pb.collection(Collections.Messages).getList(this.page + 1, PAGE_SIZE, {
			filter: `chat = "${this.chatId}"`,
			sort: '-created'
		});
		res.items.reverse();

		this._messages = [...res.items, ...this._messages];
		this.page = res.page;
		this.totalPages = res.totalPages;
		this.totalItems = res.totalItems;
		this.loading = false;
	}

	addOptimisticMessage(dto: Create<Collections.Messages>) {
		const message = {
			id: `temp-${Date.now()}`,
			...dto,
			status: MessagesStatusOptions.optimistic
		} as MessagesResponse;
		this._messages = [...this._messages, message];
	}

	subscribe(chatId: string) {
		return pb.collection(Collections.Messages).subscribe(
			'*',
			(e) => {
				const message = e.record;
				switch (e.action) {
					case 'create': {
						this._messages = this._messages.filter((m) => !m.id.startsWith('temp-'));
						this._messages = [...this._messages, message];
						break;
					}
					case 'update': {
						this._messages = this._messages.map((m) => (m.id === message.id ? message : m));
						break;
					}
					case 'delete': {
						this._messages = this._messages.filter((m) => m.id !== message.id);
						break;
					}
				}
			},
			{
				filter: `chat = "${chatId}"`
			}
		);
	}

	unsubscribe() {
		pb.collection(Collections.Messages).unsubscribe();
	}

	clear() {
		this._messages = [];
		this.page = 1;
		this.totalPages = 0;
		this.totalItems = 0;
		this.loading = true;
	}
}

export const messagesStore = new MessagesStore();
