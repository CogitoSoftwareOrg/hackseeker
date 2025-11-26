<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { pb } from '$lib';
	import ThemeController from '$lib/shared/ui/ThemeController.svelte';
	import Oauth from '../Oauth.svelte';
	import { AlertCircle } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error: any | null = $state(null);

	// enable when both fields have content
	const canSubmit = $derived(email.length > 0 && password.length > 0);

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		loading = true;

		try {
			const res = await pb!.collection('users').authWithPassword(email, password, {
				expand: ''
			});

			await goto('/app');
			await invalidate('app:global');
		} catch (err: any) {
			console.error(err);
			error = err;
		} finally {
			loading = false;
		}
	}
</script>

<div class="mx-auto mt-8 max-w-lg px-4">
	<ThemeController />

	<h1 class="mb-6 text-center text-3xl font-bold">Welcome Back!</h1>

	<!-- OAuth buttons -->
	<div class="mb-4">
		<Oauth bind:loading bind:error />
	</div>

	<div class="divider">OR</div>

	<!-- Sign-in form -->
	<form onsubmit={onSubmit} class="card space-y-4 bg-base-100 p-6 shadow-lg">
		<!-- Error Message -->
		{#if error}
			<div class="alert alert-error">
				<AlertCircle class="h-6 w-6 shrink-0 stroke-current" />
				<span class="text-sm">{error.message || 'An error occurred during sign in'}</span>
			</div>
		{/if}

		<!-- Email -->
		<div class="form-control w-full">
			<label for="email" class="label">
				<span class="label-text">Email</span>
			</label>
			<input
				id="email"
				type="email"
				placeholder="you@example.com"
				bind:value={email}
				required
				class="input-bordered input w-full"
			/>
		</div>

		<!-- Password -->
		<div class="form-control w-full">
			<label for="password" class="label">
				<span class="label-text">Password</span>
			</label>
			<input
				id="password"
				type="password"
				placeholder="••••••••"
				bind:value={password}
				required
				class="input-bordered input w-full"
			/>
		</div>

		<!-- Submit -->
		<div class="form-control mt-2 w-full">
			<button type="submit" class="btn w-full btn-primary" disabled={!canSubmit || loading}>
				{#if loading}
					<span class="loading loading-spinner"></span>
					Signing In...
				{:else}
					Sign In
				{/if}
			</button>
		</div>
	</form>

	<p class="mt-4 text-center text-sm">
		Don't have an account?
		<a href="/app/auth/sign-up" class="link font-semibold link-primary">Create one</a>
	</p>
</div>
