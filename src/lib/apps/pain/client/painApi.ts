import { Collections, pb, type Update } from '$lib';

class PainApi {
	async startValidation(chatId: string, painId: string) {
		const response = await fetch(`/api/pains/${painId}`, {
			method: 'PUT',
			credentials: 'include'
		});
		if (!response.ok) throw new Error('Failed to start validation', { cause: response.statusText });

		await pb.collection(Collections.Chats).update(chatId, { pain: painId });
	}

	async archive(id: string) {
		await pb.collection(Collections.Pains).update(id, { archived: new Date().toISOString() });
	}

	async update(id: string, dto: Update<Collections.Pains>) {
		const pain = await pb.collection(Collections.Pains).update(id, dto);
		return pain;
	}
}

export const painApi = new PainApi();
