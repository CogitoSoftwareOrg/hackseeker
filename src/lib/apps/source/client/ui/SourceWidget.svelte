<script lang="ts">
	import { X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-svelte';
	import { SourcesStatusOptions, type SourcesResponse } from '$lib';

	interface Props {
		source: SourcesResponse;
		onRemove?: (sourceId: string) => void;
	}

	const { source, onRemove }: Props = $props();

	const statusConfig = $derived.by(() => {
		switch (source.status) {
			case SourcesStatusOptions.optimistic:
			case SourcesStatusOptions.loaded:
			case SourcesStatusOptions.normalized:
				return { icon: Loader2, color: 'text-warning', spinning: true, label: 'Processing...' };
			case SourcesStatusOptions.indexed:
				return { icon: CheckCircle, color: 'text-success', spinning: false, label: 'Ready' };
			case SourcesStatusOptions.error:
				return { icon: AlertCircle, color: 'text-error', spinning: false, label: 'Error' };
			default:
				return { icon: FileText, color: 'text-base-content', spinning: false, label: 'Unknown' };
		}
	});
</script>

<div
	class="group relative flex items-center gap-2 rounded-lg border bg-base-200 px-3 py-2 text-sm"
	title={statusConfig.label}
>
	<statusConfig.icon
		class="size-4 shrink-0 {statusConfig.color} {statusConfig.spinning ? 'animate-spin' : ''}"
	/>
	<span class="max-w-24 truncate">{source.title || source.file || 'Untitled'}</span>

	{#if onRemove}
		<button
			type="button"
			onclick={() => onRemove?.(source.id)}
			class="ml-1 rounded-full p-0.5 opacity-0 transition-opacity hover:bg-base-300 group-hover:opacity-100"
		>
			<X class="size-3" />
		</button>
	{/if}
</div>
