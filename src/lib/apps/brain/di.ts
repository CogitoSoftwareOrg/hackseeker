import type { MemoryApp } from '$lib/apps/memory/core';

import { BrainAppImpl } from './app';
import { SimplePlanner, SimpleSynthesizer } from './adapters';
import type { BrainApp } from './core';

export const getBrainApp = (memoryApp: MemoryApp): BrainApp => {
	const planner = new SimplePlanner();
	const synthesizer = new SimpleSynthesizer();

	return new BrainAppImpl(planner, synthesizer, memoryApp);
};
