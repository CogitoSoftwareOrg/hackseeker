import { Collections, pb, type ArtifactsImportanceOptions } from '$lib/shared';

class ArtifactApi {
	async search(queryIds: string[], painId: string) {
		const response = await fetch(`/api/artifacts/search`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ queryIds, painId })
		});
		if (!response.ok) throw new Error('Failed to search artifacts', { cause: response.statusText });
		return response.json();
	}

	async changeImportance(artifactId: string, importance: ArtifactsImportanceOptions) {
		pb.collection(Collections.Artifacts).update(artifactId, { importance });
		// const response = await fetch(`/api/artifacts/${artifactId}/importance`, {
		//     method: 'PUT',
		//     credentials: 'include',
		//     body: JSON.stringify({ importance })
		// });
		// if (!response.ok) throw new Error('Failed to change importance', { cause: response.statusText });
		// return response.json();
	}
}

export const artifactApi = new ArtifactApi();
