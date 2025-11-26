<script lang="ts">
	interface Props {
		/** Whether the panel is in compact mode */
		compact?: boolean;
		/** Additional class for styling */
		class?: string;
	}

	let { compact = false, class: className = '' }: Props = $props();
</script>

<div class={['flex h-full flex-col', className]}>
	<div class="card">
		<div class={['card-body', compact ? 'p-3' : '']}>
			<h2 class={['card-title', compact ? 'text-base' : '']}>Control Panel</h2>
			<p class="text-sm text-base-content/70">Chat settings and widgets</p>
		</div>
	</div>

	<div class="divider my-2"></div>

	<!-- Placeholder widgets - can be extended -->
	<div class={['space-y-3', compact ? 'px-2' : 'px-4']}>
		<div class="rounded-lg bg-base-200 p-3">
			<h3 class="text-sm font-semibold">Quick Actions</h3>
			<p class="text-xs text-base-content/60">Coming soon...</p>
		</div>

		<div class="rounded-lg bg-base-200 p-3">
			<h3 class="text-sm font-semibold">Chat Info</h3>
			<p class="text-xs text-base-content/60">Coming soon...</p>
		</div>
	</div>
</div>
