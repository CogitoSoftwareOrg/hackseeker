<script lang="ts">
	import { PainsStatusOptions, type PainsResponse } from '$lib';
	import { Modal, Button } from '$lib/shared/ui';
	import { Tag, Search, Zap, Trash2 } from 'lucide-svelte';

	import { painApi } from '../painApi';

	interface Props {
		pain: PainsResponse;
		compact?: boolean;
		class?: string;
	}

	let { pain, compact = false, class: className = '' }: Props = $props();

	let confirmModalOpen = $state(false);
	let deleteModalOpen = $state(false);
	let isLoading = $state(false);

	const isDraft = $derived(pain.status === PainsStatusOptions.draft);
	const isValidation = $derived(pain.status === PainsStatusOptions.validation);

	async function handleStartValidation() {
		isLoading = true;
		try {
			await painApi.startValidation(pain.id);
			confirmModalOpen = false;
		} catch (error) {
			console.error('Failed to start validation:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleDelete() {
		isLoading = true;
		try {
			await painApi.archive(pain.id);
			deleteModalOpen = false;
		} catch (error) {
			console.error('Failed to delete pain:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class={[
		'card border border-base-300 bg-base-100 transition-shadow hover:shadow-md',
		isValidation && 'border-primary/30 bg-primary/5',
		className
	]}
>
	<div class={['card-body', compact ? 'gap-2 p-3' : 'gap-3 p-4']}>
		<!-- Header with status badge -->
		<div class="flex items-start justify-between gap-2">
			<h3 class={['card-title line-clamp-3 flex-1', compact ? 'text-xs' : 'text-sm']}>
				{pain.segment || 'Untitled Pain'}
			</h3>
			<div
				class={[
					'badge shrink-0',
					isDraft ? 'badge-ghost' : 'badge-primary',
					compact ? 'badge-xs' : 'badge-sm'
				]}
			>
				{isDraft ? 'Draft' : 'Validating'}
			</div>
		</div>

		<!-- Problem description -->
		{#if pain.problem}
			<p class={['line-clamp-3 text-base-content/70', compact ? 'text-xs' : 'text-sm']}>
				{pain.problem}
			</p>
		{/if}

		<!-- JTBD -->
		{#if pain.jtbd && !compact}
			<div class="flex items-start gap-2 text-xs text-base-content/60">
				<Zap size={12} class="mt-0.5 shrink-0" />
				<span class="line-clamp-3">{pain.jtbd}</span>
			</div>
		{/if}

		<!-- Keywords -->
		{#if pain.keywords && Array.isArray(pain.keywords) && pain.keywords.length > 0}
			<div class="flex flex-wrap gap-1">
				{#each pain.keywords.slice(0, compact ? 2 : 4) as keyword (keyword)}
					<span class={['badge badge-outline', compact ? 'badge-xs' : 'badge-sm']}>
						<Tag size={10} class="mr-1" />
						{keyword}
					</span>
				{/each}
				{#if pain.keywords.length > (compact ? 2 : 4)}
					<span class={['badge badge-ghost', compact ? 'badge-xs' : 'badge-sm']}>
						+{pain.keywords.length - (compact ? 2 : 4)}
					</span>
				{/if}
			</div>
		{/if}

		<!-- Actions -->
		{#if isDraft}
			<div class={['card-actions justify-end', compact ? 'mt-1' : 'mt-2']}>
				<Button
					size={compact ? 'xs' : 'sm'}
					variant="ghost"
					color="error"
					onclick={() => (deleteModalOpen = true)}
				>
					<Trash2 size={compact ? 12 : 14} />
				</Button>
				<Button
					size={compact ? 'xs' : 'sm'}
					color="primary"
					onclick={() => (confirmModalOpen = true)}
				>
					<Search size={compact ? 12 : 14} class="mr-1" />
					Validate
				</Button>
			</div>
		{:else if isValidation}
			<div class={['card-actions justify-end', compact ? 'mt-1' : 'mt-2']}>
				<span class="flex items-center gap-1 text-xs text-primary"> Validation </span>
			</div>
		{/if}
	</div>
</div>

<!-- Confirmation Modal -->
<Modal bind:open={confirmModalOpen} backdrop>
	<div class="space-y-4">
		<h3 class="text-lg font-bold">Start Validation?</h3>
		<p class="text-base-content/70">
			Are you ready to validate this pain point? The AI will research and gather evidence to assess
			its viability.
		</p>

		<div class="rounded-lg bg-base-200 p-3">
			<p class="font-medium">{pain.segment}</p>
			{#if pain.problem}
				<p class="mt-1 text-sm text-base-content/70">{pain.problem}</p>
			{/if}
		</div>

		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={() => (confirmModalOpen = false)} disabled={isLoading}>
				Cancel
			</Button>
			<Button color="primary" onclick={handleStartValidation} disabled={isLoading}>
				{#if isLoading}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					Start Validation
				{/if}
			</Button>
		</div>
	</div>
</Modal>

<!-- Delete Confirmation Modal -->
<Modal bind:open={deleteModalOpen} backdrop>
	<div class="space-y-4">
		<h3 class="text-lg font-bold">Archive Pain Draft?</h3>
		<p class="text-base-content/70">
			Are you sure you want to archive this pain draft? This action cannot be undone.
		</p>

		<div class="rounded-lg bg-base-200 p-3">
			<p class="font-medium">{pain.segment}</p>
		</div>

		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={() => (deleteModalOpen = false)} disabled={isLoading}>
				Cancel
			</Button>
			<Button color="error" onclick={handleDelete} disabled={isLoading}>
				{#if isLoading}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					Archive
				{/if}
			</Button>
		</div>
	</div>
</Modal>
