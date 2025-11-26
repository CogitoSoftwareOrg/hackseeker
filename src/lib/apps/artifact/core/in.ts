import type { SearchResult } from '$lib/apps/search/core';

import type { Artifact } from './models';

export type ArtifactExtractCmd = {
	painId: string;
	searchQueryId: string;
	dtos: SearchResult[];
};

export type ArtifactExtractResult = {
	markdown: string;
	links: string[];
};

export interface ArtifactApp {
	extract(cmd: ArtifactExtractCmd): Promise<Artifact[]>;
}
