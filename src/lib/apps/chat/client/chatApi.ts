import { Collections, pb, type Create, type Update } from '$lib';
import type { MessageChunk } from '$lib/apps/chat/core';
import type { AskMode } from '$lib/apps/pain/core';

import { messagesStore } from './messages.svelte.ts';

class ChatApi {
	// Create new chat
	async create(dto: Create<Collections.Chats>) {
		const chat = await pb.collection(Collections.Chats).create(dto);
		return chat;
	}

	// Update chat
	async update(id: string, dto: Update<Collections.Chats>) {
		const chat = await pb.collection(Collections.Chats).update(id, dto);
		return chat;
	}

	async sendMessage(dto: Create<Collections.Messages>, mode: AskMode) {
		if (!dto.content) throw new Error('Content is required');

		messagesStore.addOptimisticMessage(dto);

		const es = new EventSource(`/api/chats/${dto.chat}/sse?q=${encodeURIComponent(dto.content)}&mode=${mode}`, {
			withCredentials: true
		});

		es.addEventListener('chunk', (e) => {
			const chunk = JSON.parse(e.data) as MessageChunk;
			messagesStore.addChunk(chunk);
		});
		es.addEventListener('error', (e) => {
			console.error(e);
			es.close();
		});
		es.addEventListener('done', () => {
			es.close();
		});

		es.onerror = (e) => {
			console.error(e);
			es.close();
		};
	}
}

export const chatApi = new ChatApi();
