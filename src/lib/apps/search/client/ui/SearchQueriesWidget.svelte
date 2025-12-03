<script lang="ts">
	import {
		SearchQueriesStatusOptions,
		type PainsResponse,
		type SearchQueriesResponse
	} from '$lib/shared';
	import { Search, Globe, Play, Check, X, Pencil } from 'lucide-svelte';

	import { artifactApi } from '$lib/apps/artifact/client';

	import { searchQueriesStore } from '../searchQueries.svelte';
	import { searchApi } from '../searchApi';

	interface Props {
		pain: PainsResponse;
		compact?: boolean;
		class?: string;
	}

	let { pain, compact = false, class: className = '' }: Props = $props();

	// Get queries sorted: offset 0 (pending) first, then offset > 0 (used)
	const pendingQueries = $derived(
		searchQueriesStore.queries.filter((q) => !q.offset || q.offset === 0)
	);
	const usedQueries = $derived(searchQueriesStore.queries.filter((q) => q.offset && q.offset > 0));

	// Edit state
	let editingId: string | null = $state(null);
	let editQuery = $state('');
	let editSite = $state('');
	let runningIds = $derived(
		new Set(
			pendingQueries.filter((q) => q.status === SearchQueriesStatusOptions.running).map((q) => q.id)
		)
	);

	function startEdit(query: SearchQueriesResponse) {
		editingId = query.id;
		editQuery = query.query || '';
		editSite = query.site || '';
	}

	function cancelEdit() {
		editingId = null;
		editQuery = '';
		editSite = '';
	}

	async function saveEdit(query: SearchQueriesResponse) {
		if (!editingId) return;

		try {
			await searchApi.update(editingId, {
				query: editQuery,
				site: editSite || undefined
			});
			cancelEdit();
		} catch (error) {
			console.error('Failed to update query:', error);
		}
	}

	async function runSearch(query: SearchQueriesResponse) {
		// Skip if already running
		if (runningIds.has(query.id)) return;

		// Add to running set
		runningIds = new Set([...runningIds, query.id]);

		try {
			await artifactApi.search([query.id], pain.id);
		} catch (error) {
			console.error('Failed to run search:', error);
		} finally {
			// Remove from running set
			const newSet = new Set(runningIds);
			newSet.delete(query.id);
			runningIds = newSet;
		}
	}

	function getTypeLabel(type: string | undefined): string {
		if (!type) return 'general';
		return type.replace(/([A-Z])/g, ' $1').trim();
	}
</script>

<div class={['flex flex-col gap-2', className]}>
	<!-- Pending Queries (offset 0) -->
	{#if pendingQueries.length > 0}
		<div class="flex items-center gap-2 text-xs font-medium text-base-content/70">
			<Search size={12} />
			<span>Pending ({pendingQueries.length})</span>
		</div>

		{#each pendingQueries as query (query.id)}
			<div
				class="rounded-lg border border-base-300 bg-base-100 p-2 transition-colors hover:bg-base-200"
			>
				{#if editingId === query.id}
					<!-- Edit Mode -->
					<div class="space-y-2">
						<input
							type="text"
							class="input input-sm input-bordered w-full"
							placeholder="Search query..."
							bind:value={editQuery}
						/>
						<div class="flex items-center gap-2">
							<div class="relative flex-1">
								<Globe
									size={12}
									class="absolute left-2 top-1/2 -translate-y-1/2 text-base-content/40"
								/>
								<input
									type="text"
									class="input input-sm input-bordered w-full pl-7"
									placeholder="reddit.com (optional)"
									bind:value={editSite}
								/>
							</div>
							<button class="btn btn-ghost btn-sm btn-square" onclick={() => cancelEdit()}>
								<X size={14} />
							</button>
							<button class="btn btn-primary btn-sm btn-square" onclick={() => saveEdit(query)}>
								<Check size={14} />
							</button>
						</div>
					</div>
				{:else}
					<!-- View Mode -->
					<div class="flex items-start justify-between gap-2">
						<div class="min-w-0 flex-1">
							<p class="text-sm">{query.query}</p>
							{#if query.site}
								<p class="mt-0.5 flex items-center gap-1 text-xs text-base-content/50">
									<Globe size={10} />
									{query.site}
								</p>
							{/if}
						</div>
						<div class="flex items-center gap-1">
							<span class="badge badge-outline badge-xs shrink-0 capitalize">
								{getTypeLabel(query.type)}
							</span>
							<button class="btn btn-ghost btn-xs btn-square" onclick={() => startEdit(query)}>
								<Pencil size={12} />
							</button>
							<button
								class="btn btn-primary btn-xs btn-square"
								onclick={() => runSearch(query)}
								disabled={runningIds.has(query.id)}
							>
								{#if runningIds.has(query.id)}
									<span class="loading loading-spinner loading-xs"></span>
								{:else}
									<Play size={12} />
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{:else}
		<div
			class={[
				'flex items-center justify-center gap-2 py-4 text-sm text-base-content/50',
				compact && 'py-2'
			]}
		>
			<span class="loading loading-spinner loading-xs"></span>
			<span>Generating queries...</span>
		</div>
	{/if}

	<!-- Used Queries (offset > 0) -->
	{#if usedQueries.length > 0}
		<div class="divider my-1 text-xs text-base-content/40">Used</div>

		{#each usedQueries as query (query.id)}
			<div class="rounded-lg border border-base-300 bg-base-200/50 p-2 opacity-60">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0 flex-1">
						<p class="text-sm text-base-content/70">{query.query}</p>
						{#if query.site}
							<p class="mt-0.5 flex items-center gap-1 text-xs text-base-content/40">
								<Globe size={10} />
								{query.site}
							</p>
						{/if}
					</div>
					<div class="flex items-center gap-1">
						<span class="badge badge-ghost badge-xs shrink-0 capitalize">
							{getTypeLabel(query.type)}
						</span>
						<div class="badge badge-success badge-xs gap-0.5">
							<Check size={8} />
							{query.offset}
						</div>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>
