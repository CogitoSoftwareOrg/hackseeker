<script lang="ts">
	import { goto } from '$app/navigation';

	import { userStore } from '$lib/apps/user/client';

	$effect(() => {
		const user = userStore.user;
		if (user) goto('/app', { replaceState: true });
	});

	let { children } = $props();
</script>

{@render children()}
