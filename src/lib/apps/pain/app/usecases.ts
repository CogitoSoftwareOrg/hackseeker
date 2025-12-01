import type { SearchApp } from '$lib/apps/search/core';
import type { ArtifactApp } from '$lib/apps/artifact/core';
import type { ChatApp } from '$lib/apps/chat/core';
import type { Agent } from '$lib/shared/server';
import type { UserApp } from '$lib/apps/user/core';

import {
	Pain,
	type PainApp,
	type PainAskCmd,
	type AskMode,
	type GenMode,
	type GenPainPdfCmd,
	type GenPainLandingCmd,
	type Renderer,
	type PainCrud,
	type PainGenerator,
	type PainAsker,
	type PainValidator
} from '../core';

import { PainCrudImpl } from './crud';
import { PreparatorImpl } from './preparator';
import { PainAskerImpl } from './asker';
import { PainGeneratorImpl } from './generator';
import { PainValidatorImpl } from './validator';

export class PainAppImpl implements PainApp {
	private readonly crud: PainCrud;
	private readonly preparator: PreparatorImpl;
	private readonly asker: PainAsker;
	private readonly generator: PainGenerator;
	private readonly validator: PainValidator;

	constructor(
		// Adapters
		private readonly agents: Record<AskMode | GenMode, Agent>,
		private readonly renderer: Renderer,
		// Apps
		private readonly searchApp: SearchApp,
		private readonly chatApp: ChatApp,
		private readonly artifactApp: ArtifactApp,
		private readonly userApp: UserApp
	) {
		this.crud = new PainCrudImpl();
		this.preparator = new PreparatorImpl(this.crud, this.chatApp, this.userApp, this.artifactApp);
		this.asker = new PainAskerImpl(this.preparator, this.crud, this.agents, this.chatApp);
		this.generator = new PainGeneratorImpl(this.preparator, this.agents, this.renderer);
		this.validator = new PainValidatorImpl(this.crud, this.searchApp, this.chatApp);
	}

	async genPdf(cmd: GenPainPdfCmd): Promise<void> {
		return this.generator.genPdf(cmd);
	}

	async genLanding(cmd: GenPainLandingCmd): Promise<void> {
		return this.generator.genLanding(cmd);
	}

	async ask(cmd: PainAskCmd): Promise<string> {
		return this.asker.ask(cmd);
	}

	async askStream(cmd: PainAskCmd): Promise<ReadableStream> {
		return this.asker.askStream(cmd);
	}

	async startValidation(painId: string, chatId: string): Promise<Pain> {
		return this.validator.startValidation(painId, chatId);
	}
}
