import type { ArtifactsResponse } from '$lib/shared/pb/pocketbase-types';

export class Artifact {
	constructor(public readonly data: ArtifactsResponse) {}

	static fromResponse(data: ArtifactsResponse): Artifact {
		return new Artifact(data);
	}
}
