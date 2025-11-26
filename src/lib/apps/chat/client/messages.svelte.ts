import { Collections, MessagesStatusOptions, pb, type Create, type MessagesResponse } from '$lib';
import type { MessageChunk } from '$lib/apps/chat/core';

class MessagesStore {
	_messages: MessagesResponse[] = $state([]);
	messages = $derived(this._messages);

	set(messages: MessagesResponse[]) {
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
		const messages = await pb.collection(Collections.Messages).getFullList({
			filter: `chat = "${chatId}"`,
			sort: 'created'
		});
		this._messages = messages;
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
}

export const messagesStore = new MessagesStore();
