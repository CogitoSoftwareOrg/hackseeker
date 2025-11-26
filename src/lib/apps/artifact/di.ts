import { MeiliArtifactIndexer, SimpleExtractor } from './adapters';
import { ArtifactAppImpl } from './app';
import type { ArtifactApp } from './core';

export const getArtifactApp = (): ArtifactApp => {
	const extractor = new SimpleExtractor();
	const artifactIndexer = new MeiliArtifactIndexer();

	Promise.all([artifactIndexer.migrate()]).then(() => {
		console.log('Artifact indexers migrated');
	});

	const artifactApp = new ArtifactAppImpl(extractor, artifactIndexer);
	return artifactApp;
};
