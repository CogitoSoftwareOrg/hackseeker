import { Collections, pb, type Update } from '$lib';

class PainApi {
	async startValidation(chatId: string, painId: string) {
		const response = await fetch(`/api/pains/${painId}`, {
			method: 'PUT',
			credentials: 'include',
			body: JSON.stringify({ chatId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) throw new Error('Failed to start validation', { cause: response.statusText });
	}

	async archive(id: string) {
		await pb.collection(Collections.Pains).update(id, { archived: new Date().toISOString() });
	}

	async update(id: string, dto: Update<Collections.Pains>) {
		const pain = await pb.collection(Collections.Pains).update(id, dto);
		return pain;
	}

	async genPdf(painId: string, chatId: string) {
		const response = await fetch(`/api/pains/${painId}/pdf`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ chatId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) throw new Error('Failed to generate PDF', { cause: response.statusText });
		return response.json();
	}

	async genLanding(painId: string, chatId: string) {
		const response = await fetch(`/api/pains/${painId}/landing`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ chatId }),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (!response.ok) throw new Error('Failed to generate landing', { cause: response.statusText });
		return response.json();
	}
}

export const painApi = new PainApi();
