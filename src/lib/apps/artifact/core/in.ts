import type { SearchResult } from '$lib/apps/search/core';

import type { Artifact } from './models';

export type ArtifactExtractCmd = {
	userId: string;
	painId: string;
	queryId: string;
	dtos: SearchResult[];
};

export type ArtifactSearchCmd = {
	userId: string;
	painId: string;
	queryIds: string[];
};

export interface ArtifactApp {
	search(cmd: ArtifactSearchCmd): Promise<Artifact[]>;

	extract(cmd: ArtifactExtractCmd): Promise<Artifact[]>;
}
