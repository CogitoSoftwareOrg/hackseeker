<script lang="ts">
	import { userStore } from '$lib/apps/user/client';

	const user = $derived(userStore.user);
	const avatarUrl = $derived(userStore.avatarUrl);
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<div class="flex items-center gap-4">
			{#if avatarUrl}
				<img src={avatarUrl} alt={user?.name || 'User'} class="size-16 rounded-full object-cover" />
			{:else}
				<div
					class="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary"
				>
					{(user?.name || user?.email || 'U')[0].toUpperCase()}
				</div>
			{/if}
			<div class="min-w-0 flex-1">
				<h2 class="truncate text-lg font-bold">{user?.name || 'User'}</h2>
				<p class="truncate text-sm text-base-content/70">{user?.email}</p>
				{#if user?.verified === false}
					<div class="mt-1 badge badge-sm badge-warning">Email not verified</div>
				{/if}
			</div>
		</div>
	</div>
</div>
