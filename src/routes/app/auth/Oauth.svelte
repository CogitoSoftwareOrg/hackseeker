<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib';

	interface Props {
		error?: any | null;
		loading?: boolean;
		agreed?: boolean;
	}

	let {
		error = $bindable(null),
		loading = $bindable(false),
		agreed = $bindable(true)
	}: Props = $props();

	const providers = [
		{
			label: 'google',
			name: 'Google',
			icon: '🔍'
		}
	];

	const onClick = async (e: MouseEvent) => {
		if (loading) return;

		loading = true;
		error = null;

		try {
			const target = e.currentTarget as HTMLElement;
			const provider = target.dataset.provider!;

			await pb.collection('users').authWithOAuth2({
				provider,
				query: { expand: '', requestKey: 'oauth2' },
				createData: {
					metadata: {
						provider
					}
				}
			});

			await goto('/app');
		} catch (e: any) {
			console.error('Error during OAuth2 flow:', e);
			error = e;
		} finally {
			loading = false;
		}
	};
</script>

<div class="mb-4">
	<ul class="space-y-3">
		{#each providers as provider}
			<li>
				<button
					type="button"
					class="btn btn-block btn-outline"
					onclick={onClick}
					disabled={loading || !agreed}
					data-provider={provider.label}
				>
					{#if loading}
						<span class="loading loading-sm loading-spinner"></span>
					{/if}
					<span class="ml-2">
						{loading ? 'Connecting...' : `Continue with ${provider.name}`}
					</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
