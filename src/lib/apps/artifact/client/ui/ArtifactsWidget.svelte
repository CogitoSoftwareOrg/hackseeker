<script lang="ts">
	import {
		ArtifactsTypeOptions,
		ArtifactsImportanceOptions,
		type ArtifactsResponse
	} from '$lib/shared';
	import {
		Search,
		Quote,
		Zap,
		Users,
		Wrench,
		Package,
		ExternalLink,
		ChevronUp,
		Minus,
		ChevronDown,
		Filter
	} from 'lucide-svelte';

	import { artifactsStore } from '../artifacts.svelte';
	import { artifactApi } from '../artifactApi';
	import { searchQueriesStore } from '$lib/apps/search/client';

	interface Props {
		compact?: boolean;
		class?: string;
	}

	let { compact = false, class: className = '' }: Props = $props();

	// Filter state
	let searchText = $state('');
	let filterQueryId: string | null = $state(null);

	// Get queries for filter dropdown
	const queries = $derived(searchQueriesStore.queries);

	// Importance order for sorting
	const importanceOrder: Record<ArtifactsImportanceOptions, number> = {
		[ArtifactsImportanceOptions.high]: 0,
		[ArtifactsImportanceOptions.mid]: 1,
		[ArtifactsImportanceOptions.low]: 2
	};

	// Filtered and sorted artifacts
	const filteredArtifacts = $derived.by(() => {
		let result = [...artifactsStore.artifacts];

		// Filter by search text
		if (searchText.trim()) {
			const lower = searchText.toLowerCase();
			result = result.filter((a) => {
				const content = getArtifactContent(a).toLowerCase();
				const title = (a.title || '').toLowerCase();
				return content.includes(lower) || title.includes(lower);
			});
		}

		// Filter by query
		if (filterQueryId) {
			result = result.filter((a) => a.searchQuery === filterQueryId);
		}

		// Sort by importance
		result.sort((a, b) => {
			const aOrder = importanceOrder[a.importance || ArtifactsImportanceOptions.mid];
			const bOrder = importanceOrder[b.importance || ArtifactsImportanceOptions.mid];
			return aOrder - bOrder;
		});

		return result;
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

	function getArtifactContent(artifact: ArtifactsResponse): string {
		if (typeof artifact.payload === 'object' && artifact.payload !== null) {
			const payload = artifact.payload as Record<string, unknown>;
			return String(
				payload.content || payload.description || payload.name || JSON.stringify(artifact.payload)
			);
		}
		return String(artifact.payload || '');
	}

	async function setImportance(
		artifact: ArtifactsResponse,
		importance: ArtifactsImportanceOptions
	) {
		try {
			await artifactApi.changeImportance(artifact.id, importance);
		} catch (error) {
			console.error('Failed to change importance:', error);
		}
	}

	function getQueryLabel(queryId: string): string {
		const query = queries.find((q) => q.id === queryId);
		if (!query) return 'Unknown';
		return (
			query.query?.slice(0, 30) + (query.query && query.query.length > 30 ? '...' : '') ||
			'Untitled'
		);
	}
</script>

<div class={['flex flex-col gap-2', className]}>
	<!-- Search & Filters -->
	<div class="flex flex-col gap-2">
		<!-- Search input -->
		<div class="relative">
			<Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
			<input
				type="text"
				class="input input-sm input-bordered w-full pl-9"
				placeholder="Search artifacts..."
				bind:value={searchText}
			/>
		</div>

		<!-- Query filter -->
		{#if queries.length > 0}
			<div class="flex items-center gap-2">
				<Filter size={12} class="text-base-content/50" />
				<select class="select select-bordered flex-1" bind:value={filterQueryId}>
					<option value={null}>All queries</option>
					{#each queries as query (query.id)}
						<option value={query.id}>{getQueryLabel(query.id)}</option>
					{/each}
				</select>
				{#if filterQueryId}
					<button class="btn btn-ghost btn-xs" onclick={() => (filterQueryId = null)}>
						Clear
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Artifacts list -->
	{#if filteredArtifacts.length > 0}
		<div class="space-y-2">
			{#each filteredArtifacts as artifact (artifact.id)}
				{@const Icon = getArtifactIcon(artifact.type)}
				<div
					class="rounded-lg border border-base-300 bg-base-100 p-2 transition-colors hover:bg-base-200"
				>
					<div class="flex items-start gap-2">
						<!-- Type icon -->
						<div class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-base-200">
							<Icon size={12} class="text-base-content/60" />
						</div>

						<!-- Content -->
						<div class="min-w-0 flex-1">
							{#if artifact.title}
								<p class="text-xs font-medium text-base-content/80">{artifact.title}</p>
							{/if}
							<p class={['line-clamp-2 text-sm', artifact.title && 'text-base-content/70']}>
								{getArtifactContent(artifact)}
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

						<!-- Importance controls -->
						<div class="flex flex-col items-center gap-0.5">
							<button
								class={[
									'btn btn-ghost btn-xs btn-square',
									artifact.importance === ArtifactsImportanceOptions.high && 'text-success'
								]}
								onclick={() => setImportance(artifact, ArtifactsImportanceOptions.high)}
								title="High importance"
							>
								<ChevronUp size={14} />
							</button>
							<button
								class={[
									'btn btn-ghost btn-xs btn-square',
									(!artifact.importance ||
										artifact.importance === ArtifactsImportanceOptions.mid) &&
										'bg-base-200'
								]}
								onclick={() => setImportance(artifact, ArtifactsImportanceOptions.mid)}
								title="Medium importance"
							>
								<Minus size={14} />
							</button>
							<button
								class={[
									'btn btn-ghost btn-xs btn-square',
									artifact.importance === ArtifactsImportanceOptions.low && 'text-base-content/40'
								]}
								onclick={() => setImportance(artifact, ArtifactsImportanceOptions.low)}
								title="Low importance"
							>
								<ChevronDown size={14} />
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else if artifactsStore.artifacts.length === 0}
		<div
			class={[
				'flex items-center justify-center gap-2 py-4 text-sm text-base-content/50',
				compact && 'py-2'
			]}
		>
			<span>No artifacts found yet</span>
		</div>
	{:else}
		<div class="py-4 text-center text-sm text-base-content/50">No artifacts match your filters</div>
	{/if}
</div>
