import { Collections, PainsStatusOptions, pb, type Update } from '$lib';

class PainApi {
	async update(id: string, dto: Update<Collections.Pains>) {
		const pain = await pb.collection(Collections.Pains).update(id, dto);
		return pain;
	}

	async startValidation(id: string) {
		return this.update(id, { status: PainsStatusOptions.validation });
	}

	async archive(id: string) {
		await pb.collection(Collections.Pains).update(id, { archived: new Date().toISOString() });
	}
}

export const painApi = new PainApi();
