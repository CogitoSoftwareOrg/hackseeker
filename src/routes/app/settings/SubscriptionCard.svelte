<script lang="ts">
	import { Crown, Settings, Rocket } from 'lucide-svelte';
	import { Button, uiStore } from '$lib/shared/ui';
	import { subStore } from '$lib/apps/user/client';

	const sub = $derived(subStore.sub);
	const paid = $derived(sub?.status === 'active' && sub.tariff !== 'free');

	// Assuming pointsLimit and pointsUsage are the relevant metrics based on existing code
	const pointsUsage = $derived(sub?.pointsUsage ?? 0);
	const pointsLimit = $derived(sub?.pointsLimit ?? 0);
	const usageProgress = $derived(pointsLimit > 0 ? (pointsUsage / pointsLimit) * 100 : 0);

	async function manageSubscription() {
		// Placeholder for portal redirection logic
		// In a real app, this would call an API endpoint to get the portal URL
		// For now, we can just show the paywall or a message
		console.log('Manage subscription clicked');
		// If we have a portal link, we'd go there.
		// If not implemented yet, maybe just open paywall for upgrade/downgrade?
		// User example had: const response = await postApi('stripe/portal', ...);
		// I'll leave it as a TODO or basic alert for now if no API is ready.
		alert('Subscription management portal coming soon!');
	}
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="flex items-center justify-between">
			<span class="text-sm font-semibold">Subscription</span>
			{#if paid}
				<div class="badge gap-1 badge-sm badge-success">
					<Crown class="h-3 w-3" />
					{sub?.tariff ? sub.tariff.charAt(0).toUpperCase() + sub.tariff.slice(1) : 'Premium'}
				</div>
			{:else}
				<div class="badge badge-ghost badge-sm">Free</div>
			{/if}
		</div>

		<!-- Usage Widget -->
		{#if pointsLimit > 0}
			<div class="mt-4 space-y-2">
				<div class="flex items-center justify-between">
					<span class="text-xs font-semibold">Points</span>
					<span class="text-xs font-medium text-base-content/70">
						{pointsUsage} / {pointsLimit}
					</span>
				</div>
				<progress
					class="progress {usageProgress >= 90
						? 'progress-error'
						: usageProgress >= 70
							? 'progress-warning'
							: 'progress-primary'}"
					value={usageProgress}
					max="100"
				></progress>
				<div class="flex items-center justify-between gap-2">
					<div class="text-xs text-base-content/60">
						{Math.round(usageProgress)}% used
					</div>
					<div class="text-xs text-base-content/60">
						{pointsLimit - pointsUsage} remaining
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-3">
			{#if paid}
				<Button onclick={manageSubscription} style="soft" size="sm" class="w-full">
					<Settings class="mr-2 h-4 w-4" />
					Manage Subscription
				</Button>
			{:else}
				<Button onclick={() => uiStore.setPaywallOpen(true)} size="sm" class="w-full">
					<Rocket class="mr-2 h-4 w-4" />
					Upgrade to Premium
				</Button>
			{/if}
		</div>
	</div>
</div>
