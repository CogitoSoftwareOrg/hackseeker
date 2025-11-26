<script lang="ts">
	import { X } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib';
	import { Button, ThemeController } from '$lib/shared/ui';

	// Import profile components
	import ProfileCard from './ProfileCard.svelte';
	import SubscriptionCard from './SubscriptionCard.svelte';
	import LegalCard from './LegalCard.svelte';

	function logout() {
		pb!.authStore.clear();
		goto('/app/auth/sign-in');
	}
</script>

<div class="mx-auto w-full max-w-7xl space-y-4 p-4 sm:space-y-0 sm:p-6 lg:p-4 overflow-y-auto">
	<div class="mb-4 flex items-center justify-between sm:mb-6">
		<h1 class="mx-auto text-2xl font-bold sm:text-3xl">Profile & Settings</h1>
		<ThemeController />
	</div>

	<div class="mx-auto max-w-xl space-y-4">
		<ProfileCard />

		<SubscriptionCard />

		<LegalCard />

		<Button class="mt-2 w-full" onclick={logout} variant="soft" color="error">
			<X class="mr-2 h-4 w-4" />
			Logout
		</Button>
	</div>
</div>
