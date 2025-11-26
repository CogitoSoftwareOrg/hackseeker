<script lang="ts">
	import type { WorkflowMode } from '$lib/apps/brain/core';
	import { Lightbulb, Search, Sparkles } from 'lucide-svelte';

	import { chatsStore } from '$lib/apps/chat/client';
	import { painsStore, PainCard } from '$lib/apps/pain/client';
	import { PainsStatusOptions } from '$lib/shared';

	interface Props {
		/** Whether the panel is in compact mode */
		compact?: boolean;
		/** Additional class for styling */
		class?: string;
		chatId: string;
	}

	let { compact = false, class: className = '', chatId }: Props = $props();

	const chat = $derived(chatsStore.chats.find((c) => c.id === chatId));
	const pains = $derived(chat ? painsStore.getByChatId(chat.id).filter((p) => !p.archived) : []);

	const draftPains = $derived(pains.filter((p) => p.status === PainsStatusOptions.draft));
	const validatingPain = $derived(pains.find((p) => p.status === PainsStatusOptions.validation));

	const mode: WorkflowMode = $derived(validatingPain ? 'validation' : 'discovery');
</script>

<div class={['flex h-full flex-col overflow-hidden', className]}>
	<!-- Header -->
	<div class={['shrink-0 border-b border-base-300', compact ? 'p-3' : 'p-4']}>
		<div class="flex items-center gap-2">
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
	</div>

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
						<PainCard {pain} {compact} />
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
			<!-- Validation Mode: Show validating pain -->
			<div class={['space-y-3', compact ? 'p-2' : 'p-4']}>
				{#if validatingPain}
					<div class="flex items-center gap-2 text-xs font-medium text-primary">
						<Search size={12} />
						<span>Currently Validating</span>
					</div>

					<PainCard pain={validatingPain} {compact} />

					<!-- Research progress placeholder -->
					<div class="rounded-lg bg-base-200 p-3">
						<div class="flex items-center gap-2 text-sm font-medium">
							<span class="loading loading-dots loading-xs text-primary"></span>
							<span>Gathering evidence...</span>
						</div>
						<p class="mt-1 text-xs text-base-content/60">
							The AI is researching this pain point to assess its viability.
						</p>
					</div>
				{/if}

				{#if draftPains.length > 0}
					<div class="divider my-2 text-xs">Other Drafts</div>
					{#each draftPains as pain (pain.id)}
						<PainCard {pain} {compact} />
					{/each}
				{/if}
			</div>
		{/if}
	</div>
</div>
