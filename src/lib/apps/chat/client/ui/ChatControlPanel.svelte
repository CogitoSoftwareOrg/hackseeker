<script lang="ts">
	import type { WorkflowMode } from '$lib/apps/brain/core';
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
		ExternalLink
	} from 'lucide-svelte';

	import { painsStore, PainCard } from '$lib/apps/pain/client';
	import { searchQueriesStore } from '$lib/apps/search/client';
	import { artifactsStore } from '$lib/apps/artifact/client';
	import {
		PainsStatusOptions,
		ArtifactsTypeOptions,
		type PainsResponse,
		type ChatsResponse
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

	const mode: WorkflowMode = $derived(chat.pain ? 'validation' : 'discovery');

	// Tabs state
	let activeTab: 'queries' | 'artifacts' = $state('queries');

	// Artifact counts by type
	const artifactCounts = $derived({
		quotes: artifacts.filter((a) => a.type === ArtifactsTypeOptions.quote).length,
		insights: artifacts.filter((a) => a.type === ArtifactsTypeOptions.insight).length,
		competitors: artifacts.filter((a) => a.type === ArtifactsTypeOptions.competitor).length,
		hacks: artifacts.filter((a) => a.type === ArtifactsTypeOptions.hack).length
	});

	function getArtifactIcon(type: ArtifactsTypeOptions) {
		switch (type) {
			case ArtifactsTypeOptions.quote:
				return Quote;
			case ArtifactsTypeOptions.insight:
				return Zap;
			case ArtifactsTypeOptions.competitor:
				return Users;
			case ArtifactsTypeOptions.hack:
				return Wrench;
			default:
				return Package;
		}
	}

	function getMetrics(pain: PainsResponse): Record<string, number> | null {
		if (!pain.metrics || typeof pain.metrics !== 'object') return null;
		return pain.metrics as Record<string, number>;
	}
</script>

{#if chat}
	<div class={['flex h-full flex-col overflow-hidden', className]}>
		<!-- Header -->
		<header class={['shrink-0 border-b border-base-300 h-12', compact ? 'px-3' : 'px-4']}>
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

						<!-- Tab Content -->
						<div class="space-y-2">
							{#if activeTab === 'queries'}
								{#if searchQueries.length > 0}
									{#each searchQueries as query (query.id)}
										<div
											class="rounded-lg border border-base-300 bg-base-100 p-2 transition-colors hover:bg-base-200"
										>
											<div class="flex items-start justify-between gap-2">
												<p class="flex-1 text-sm">{query.query}</p>
												<span class="badge badge-outline badge-xs shrink-0 capitalize">
													{query.type?.replace(/([A-Z])/g, ' $1').trim() || 'general'}
												</span>
											</div>
										</div>
									{/each}
								{:else}
									<div
										class="flex items-center justify-center gap-2 py-4 text-sm text-base-content/50"
									>
										<span class="loading loading-spinner loading-xs"></span>
										<span>Generating queries...</span>
									</div>
								{/if}
							{:else if artifacts.length > 0}
								{#each artifacts as artifact (artifact.id)}
									{@const Icon = getArtifactIcon(artifact.type)}
									<div
										class="rounded-lg border border-base-300 bg-base-100 p-2 transition-colors hover:bg-base-200"
									>
										<div class="flex items-start gap-2">
											<div
												class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-base-200"
											>
												<Icon size={12} class="text-base-content/60" />
											</div>
											<div class="min-w-0 flex-1">
												<p class="line-clamp-2 text-sm">
													{typeof artifact.payload === 'object' && artifact.payload !== null
														? (artifact.payload as Record<string, unknown>).content ||
															(artifact.payload as Record<string, unknown>).description ||
															(artifact.payload as Record<string, unknown>).name ||
															JSON.stringify(artifact.payload)
														: artifact.payload}
												</p>
												{#if artifact.source}
													<a
														href={artifact.source}
														target="_blank"
														rel="noopener noreferrer"
														class="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
													>
														<ExternalLink size={10} />
														Source
													</a>
												{/if}
											</div>
										</div>
									</div>
								{/each}
							{:else}
								<div
									class="flex items-center justify-center gap-2 py-4 text-sm text-base-content/50"
								>
									<span class="loading loading-spinner loading-xs"></span>
									<span>Extracting artifacts...</span>
								</div>
							{/if}
						</div>
					{/if}

					<!-- Other Drafts -->
					<!-- {#if draftPains.length > 0}
					<div class="divider my-2 text-xs">Other Drafts</div>
					{#each draftPains as pain (pain.id)}
						<PainCard {pain} {compact} />
					{/each}
				{/if} -->
				</div>
			{/if}
		</div>
	</div>
{/if}
