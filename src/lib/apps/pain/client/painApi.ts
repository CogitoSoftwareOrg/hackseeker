import { Collections, pb, type Update } from '$lib';

class PainApi {
	async startValidation(chatId: string, painId: string) {
		const response = await fetch(`/api/pains/${painId}`, {
			method: 'PUT',
			credentials: 'include'
		});
		if (!response.ok) throw new Error('Failed to start validation', { cause: response.statusText });

		const pain = await pb.collection(Collections.Pains).getOne(painId);
		await pb.collection(Collections.Chats).update(chatId, { pain: painId, title: pain.segment });
	}

	async archive(id: string) {
		await pb.collection(Collections.Pains).update(id, { archived: new Date().toISOString() });
	}

	async update(id: string, dto: Update<Collections.Pains>) {
		const pain = await pb.collection(Collections.Pains).update(id, dto);
		return pain;
	}

	async genPdf(id: string) {
		const response = await fetch(`/api/pains/${id}/pdf`, {
			method: 'POST',
			credentials: 'include'
		});
		if (!response.ok) throw new Error('Failed to generate PDF', { cause: response.statusText });
		return response.json();
	}

	async genLanding(id: string) {
		const response = await fetch(`/api/pains/${id}/landing`, {
			method: 'POST',
			credentials: 'include'
		});
		if (!response.ok) throw new Error('Failed to generate landing', { cause: response.statusText });
		return response.json();
	}
}

export const painApi = new PainApi();
