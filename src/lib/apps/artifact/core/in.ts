import type { SearchResult } from '$lib/apps/search/core';

import type { Artifact } from './models';

export type ArtifactExtractCmd = {
	userId: string;
	painId: string;
	queryId: string;
	dtos: SearchResult[];
};

export type ArtifactGetMemoriesCmd = {
	userId: string;
	painId: string;
	query: string;
	tokens: number;
};

export type ArtifactSearchCmd = {
	userId: string;
	painId: string;
	queryIds: string[];
};

export interface ArtifactApp {
	getMemories(cmd: ArtifactGetMemoriesCmd): Promise<Artifact[]>;

	search(cmd: ArtifactSearchCmd): Promise<Artifact[]>;

	extract(cmd: ArtifactExtractCmd): Promise<Artifact[]>;
}
