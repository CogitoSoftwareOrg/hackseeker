<script lang="ts">
	import type { AskMode } from '$lib/apps/pain/core';

	import {
		Lightbulb,
		Search,
		Sparkles,
		FileSearch,
		Package,
		Quote,
		Zap,
		Users,
		Wrench,
		File,
		Landmark
	} from 'lucide-svelte';

	import { painsStore, PainCard, painApi } from '$lib/apps/pain/client';
	import { SearchQueriesWidget, searchQueriesStore } from '$lib/apps/search/client';
	import { ArtifactsWidget, artifactsStore } from '$lib/apps/artifact/client';
	import {
		PainsStatusOptions,
		ArtifactsTypeOptions,
		type PainsResponse,
		type ChatsResponse,
		Button,
		Modal,
		pb
	} from '$lib/shared';

	interface Props {
		compact?: boolean;
		class?: string;
		chat: ChatsResponse;
	}

	let { compact = false, class: className = '', chat }: Props = $props();

	const pains = $derived(chat ? painsStore.getByChatId(chat.id).filter((p) => !p.archived) : []);
	const searchQueries = $derived(chat.pain ? searchQueriesStore.queries : []);
	const artifacts = $derived(chat.pain ? artifactsStore.artifacts : []);

	const draftPains = $derived(pains.filter((p) => p.status === PainsStatusOptions.draft));

	const pain = $derived(chat.pain ? pains.find((p) => p.id === chat.pain) : null);

	const mode: AskMode = $derived(chat.pain ? 'validation' : 'discovery');

	let pdfModalOpen = $state(false);
	let landingModalOpen = $state(false);

	let landingGenerating = $state(false);
	let pdfGenerating = $state(false);

	// Tabs state
	let activeTab: 'queries' | 'artifacts' = $state('queries');

	// Artifact counts by type
	const artifactCounts = $derived({
		quotes: artifacts.filter((a) => a.type === ArtifactsTypeOptions.quote).length,
		insights: artifacts.filter((a) => a.type === ArtifactsTypeOptions.insight).length,
		competitors: artifacts.filter((a) => a.type === ArtifactsTypeOptions.competitor).length,
		hacks: artifacts.filter((a) => a.type === ArtifactsTypeOptions.hack).length
	});

	function getMetrics(pain: PainsResponse): Record<string, number> | null {
		if (!pain.metrics || typeof pain.metrics !== 'object') return null;
		return pain.metrics as Record<string, number>;
	}

	async function genPdf() {
		if (!pain) return;
		pdfModalOpen = false;

		try {
			pdfGenerating = true;
			await painApi.genPdf(pain.id, chat.id);
		} catch (error) {
			console.error(error);
		} finally {
			pdfGenerating = false;
		}
	}

	async function genLanding() {
		if (!pain) return;
		landingModalOpen = false;

		try {
			landingGenerating = true;
			await painApi.genLanding(pain.id, chat.id);
		} catch (error) {
			console.error(error);
		} finally {
			landingGenerating = false;
		}
	}
</script>

{#if chat}
	<div class={['flex h-full flex-col overflow-hidden', className]}>
		<!-- Header -->
		<header
			class={[
				'shrink-0 border-b border-base-300 h-12 flex items-center justify-between',
				compact ? 'px-3' : 'px-4'
			]}
		>
			<div class="flex items-center gap-2 h-full">
				{#if mode === 'discovery'}
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
						<Lightbulb size={16} class="text-warning" />
					</div>
				{:else}
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
						<Search size={16} class="text-primary" />
					</div>
				{/if}
				<div>
					<h2 class={['font-semibold', compact ? 'text-sm' : 'text-base']}>
						{mode === 'discovery' ? 'Pain Discovery' : 'Validation'}
					</h2>
					<p class="text-xs text-base-content/60">
						{mode === 'discovery' ? 'Identify problems worth solving' : 'Researching your pain'}
					</p>
				</div>
			</div>

			{#if mode === 'validation'}
				<div class="flex items-center gap-2">
					{#if !pain?.report}
						<Button
							disabled={pdfGenerating}
							size="sm"
							variant="ghost"
							onclick={() => (pdfModalOpen = true)}
						>
							<File size={16} />
							<span class="hidden sm:block">Gen PDF</span>
							<span class="sm:hidden">PDF</span>
						</Button>
					{:else}
						<Button
							target="_blank"
							href={pb.files.getURL(pain, pain.report)}
							disabled={pdfGenerating}
							size="sm"
							variant="soft"
							color="success"
							onclick={() => (pdfModalOpen = true)}
						>
							<File size={16} />
							<span class="hidden sm:block">View PDF</span>
							<span class="sm:hidden">PDF</span>
						</Button>
					{/if}

					{#if !pain?.landing}
						<Button
							disabled={landingGenerating}
							size="sm"
							variant="ghost"
							onclick={() => (landingModalOpen = true)}
						>
							<Landmark size={16} />
							<span class="hidden sm:block">Gen Landing page</span>
							<span class="sm:hidden">Landing</span>
						</Button>
					{:else}
						<Button
							target="_blank"
							href={`/pages/${pain.id}`}
							disabled={landingGenerating}
							size="sm"
							variant="soft"
							color="success"
						>
							<Landmark size={16} />
							<span class="hidden sm:block">View Landing</span>
							<span class="sm:hidden">Landing</span>
						</Button>
					{/if}
				</div>
			{/if}
		</header>

		<!-- Content -->
		<div class="flex-1 overflow-y-auto">
			{#if mode === 'discovery'}
				<!-- Discovery Mode: Show draft pains -->
				<div class={['space-y-3', compact ? 'p-2' : 'p-4']}>
					{#if draftPains.length > 0}
						<div class="flex items-center gap-2 text-xs font-medium text-base-content/70">
							<Sparkles size={12} />
							<span>Pain Drafts ({draftPains.length})</span>
						</div>

						{#each draftPains as pain (pain.id)}
							<PainCard {chat} {pain} {compact} />
						{/each}
					{:else}
						<div
							class={[
								'flex flex-col items-center justify-center rounded-lg border border-dashed border-base-300 text-center',
								compact ? 'gap-2 p-4' : 'gap-3 p-6'
							]}
						>
							<div
								class={[
									'flex items-center justify-center rounded-full bg-base-200',
									compact ? 'h-10 w-10' : 'h-12 w-12'
								]}
							>
								<Lightbulb size={compact ? 20 : 24} class="text-base-content/40" />
							</div>
							<div>
								<p class={['font-medium text-base-content/70', compact ? 'text-sm' : '']}>
									No pain drafts yet
								</p>
								<p class={['text-base-content/50', compact ? 'text-xs' : 'text-sm']}>
									Chat with the AI to discover problems
								</p>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<!-- Validation Mode -->
				<div class={['space-y-3', compact ? 'p-2' : 'p-4']}>
					{#if pain}
						<!-- Pain Card -->
						<PainCard {chat} {pain} {compact} />

						<!-- Metrics Widget -->
						{@const metrics = getMetrics(pain)}
						{#if metrics && Object.keys(metrics).length > 0}
							<div class="rounded-lg border border-base-300 bg-base-100 p-3">
								<div class="mb-2 flex items-center gap-2 text-xs font-medium text-base-content/70">
									<Sparkles size={12} />
									<span>Validation Score</span>
								</div>
								<div class="grid grid-cols-2 gap-2">
									{#each Object.entries(metrics) as [key, value] (key)}
										<div class="flex items-center justify-between rounded bg-base-200 px-2 py-1">
											<span class="text-xs text-base-content/60 capitalize">{key}</span>
											<span class="text-sm font-semibold">{value}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<!-- Artifact Summary -->
						{#if artifacts.length > 0}
							<div class="flex flex-wrap gap-2">
								{#if artifactCounts.quotes > 0}
									<div class="badge badge-ghost badge-sm gap-1">
										<Quote size={10} />
										{artifactCounts.quotes} quotes
									</div>
								{/if}
								{#if artifactCounts.insights > 0}
									<div class="badge badge-ghost badge-sm gap-1">
										<Zap size={10} />
										{artifactCounts.insights} insights
									</div>
								{/if}
								{#if artifactCounts.competitors > 0}
									<div class="badge badge-ghost badge-sm gap-1">
										<Users size={10} />
										{artifactCounts.competitors} competitors
									</div>
								{/if}
								{#if artifactCounts.hacks > 0}
									<div class="badge badge-ghost badge-sm gap-1">
										<Wrench size={10} />
										{artifactCounts.hacks} hacks
									</div>
								{/if}
							</div>
						{/if}

						<!-- Tabs -->
						<div class="tabs tabs-boxed tabs-sm bg-base-200">
							<button
								class={['tab flex-1 gap-1', activeTab === 'queries' && 'tab-active']}
								onclick={() => (activeTab = 'queries')}
							>
								<FileSearch size={14} />
								Queries ({searchQueries.length})
							</button>
							<button
								class={['tab flex-1 gap-1', activeTab === 'artifacts' && 'tab-active']}
								onclick={() => (activeTab = 'artifacts')}
							>
								<Package size={14} />
								Artifacts ({artifacts.length})
							</button>
						</div>

						<!-- Tab Content: Widgets -->
						{#if activeTab === 'queries'}
							<SearchQueriesWidget {pain} {compact} />
						{:else}
							<ArtifactsWidget {compact} />
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<Modal backdrop open={pdfModalOpen} onclose={() => (pdfModalOpen = false)}>
	<h3 class="font-bold text-lg">Gen PDF</h3>
	<p>Generating a PDF report for your pain. This may take a few minutes.</p>
	<div class="modal-action">
		<Button variant="ghost" onclick={() => (pdfModalOpen = false)}>Cancel</Button>
		<Button variant="solid" onclick={() => genPdf()}>Generate</Button>
	</div>
</Modal>

<Modal backdrop open={landingModalOpen} onclose={() => (landingModalOpen = false)}>
	<h3 class="font-bold text-lg">Gen Landing</h3>
	<p>Generating a landing page for your pain. This may take a few minutes.</p>
	<div class="modal-action">
		<Button variant="ghost" onclick={() => (landingModalOpen = false)}>Cancel</Button>
		<Button variant="solid" onclick={() => genLanding()}>Generate</Button>
	</div>
</Modal>
