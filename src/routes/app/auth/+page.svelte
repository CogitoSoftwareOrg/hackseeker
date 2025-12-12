<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { Heart, Shield, AlertCircle } from 'lucide-svelte';
	import posthog from 'posthog-js';

	import { pb } from '$lib';
	import ThemeController from '$lib/shared/ui/ThemeController.svelte';

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

		// loading = true;
		error = null;

		try {
			const target = e.currentTarget as HTMLElement;
			const provider = target.dataset.provider!;

			posthog.capture('oauth_started', { provider });

			const res = await pb.collection('users').authWithOAuth2({
				provider,
				query: { expand: '', requestKey: 'oauth2' },
				createData: {
					metadata: {
						provider
					}
				}
			});

			posthog.capture('oauth_completed', { provider });

			await goto('/app/stories');
			await invalidate('app:global');
		} catch (e: any) {
			console.error('Error during OAuth2 flow:', e);
			error = e;
		} finally {
			loading = false;
		}
	};
</script>

<div class="mx-auto mt-8 max-w-lg px-4">
	<div class="mb-6 flex justify-end">
		<ThemeController />
	</div>

	<!-- Welcome Header -->
	<div class="mb-8 text-center">
		<div class="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
			<Heart class="h-8 w-8 text-primary" />
		</div>
		<h1 class="mb-2 text-3xl font-bold text-base-content">Welcome to HackSeeker</h1>
		<p class="text-base text-base-content/70">
			Begin your journey of
			<span class="font-semibold text-primary">building your next big thing</span>
		</p>
	</div>

	<!-- OAuth Providers -->
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
						{:else}
							<!-- <span class="text-lg">{provider.icon}</span> -->
						{/if}
						<span class="ml-2">
							{loading ? 'Connecting...' : `Continue with ${provider.name}`}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Legal Agreement -->
	{#if agreed}
		<div class="mb-6 rounded-lg bg-base-200 p-4">
			<div class="flex items-start gap-2">
				<Shield class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
				<p class="text-xs leading-relaxed text-base-content/70">
					By continuing, you agree to our
					<a
						href="/legal/terms-and-conditions"
						class="link link-primary"
						target="_blank"
						rel="noopener noreferrer"
					>
						Terms and Conditions
					</a>
					and
					<a
						href="/legal/privacy-policy"
						class="link link-primary"
						target="_blank"
						rel="noopener noreferrer"
					>
						Privacy Policy
					</a>
					. Your stories are encrypted and remain completely private.
				</p>
			</div>
		</div>
	{:else}
		<div class="mb-6 rounded-lg bg-warning/10 p-4">
			<p class="mb-3 text-sm font-medium text-warning">
				You must agree to the terms and conditions to continue
			</p>
			<div class="form-control">
				<label for="agree" class="label flex cursor-pointer items-start gap-2">
					<input
						id="agree"
						type="checkbox"
						bind:checked={agreed}
						class="checkbox mt-0.5 checkbox-primary"
					/>
					<span class="label-text text-xs text-base-content/80">
						I agree to the
						<a
							href="/legal/terms-and-conditions"
							class="link link-primary"
							target="_blank"
							rel="noopener noreferrer"
						>
							Terms and Conditions
						</a>
						&nbsp;and&nbsp;
						<a
							href="/legal/privacy-policy"
							class="link link-primary"
							target="_blank"
							rel="noopener noreferrer"
						>
							Privacy Policy
						</a>
					</span>
				</label>
			</div>
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="mb-4 alert alert-error">
			<!-- Use Lucide Svelte XCircle icon for error alert -->
			<AlertCircle class="h-6 w-6 shrink-0 stroke-current" />
			<span class="text-sm">{error.message || 'An error occurred during authentication'}</span>
		</div>
	{/if}

	<!-- Back to Home Link -->
	<div class="mt-6 text-center">
		<a href="/" class="link text-sm text-base-content/70 link-hover">← Back to home</a>
	</div>
</div>
