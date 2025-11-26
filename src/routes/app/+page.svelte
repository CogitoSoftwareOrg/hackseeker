<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { Sparkles, MessageCircle, Plus, ArrowRight, History } from 'lucide-svelte';

	import { ChatsStatusOptions } from '$lib';
	import { chatsStore, chatApi } from '$lib/apps/chat/client';
	import { userStore } from '$lib/apps/user/client';
	import { uiStore } from '$lib/shared/ui/ui.svelte';
	import { Button } from '$lib/shared/ui';

	const user = $derived(userStore.user);
	const chats = $derived(chatsStore.chats);

	// Assuming chats are sorted by recency or created date.
	// If not, we might want to sort them here.
	const lastChat = $derived(chats.length > 0 ? chats[0] : null);

	let loading = $state(false);

	async function handleNewChat() {
		if (!user) return uiStore.setAuthWallOpen(true);

		loading = true;
		try {
			let emptyChat = chatsStore.getEmpty();

			if (!emptyChat) {
				emptyChat = await chatApi.create({
					title: 'New Chat',
					status: ChatsStatusOptions.empty,
					user: user.id
				});
			}
			goto(`/app/chats/${emptyChat.id}`);
		} catch (error) {
			console.error('Failed to create chat:', error);
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="flex min-h-full flex-col items-center justify-center bg-linear-to-br from-base-100 to-base-200 p-6 text-center"
>
	<div class="max-w-md space-y-8" in:fade={{ duration: 800 }}>
		<!-- Hero Section -->
		<div class="space-y-4">
			<div
				class="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 text-primary ring-8 ring-primary/5 mb-4"
			>
				<Sparkles size={48} strokeWidth={1.5} />
			</div>

			<h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl">
				<span class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
					Hello, {user?.name || 'Friend'}!
				</span>
			</h1>

			<p class="text-lg text-base-content/70">
				Ready to explore new ideas? Start a conversation and see where it goes.
			</p>
		</div>

		<!-- Actions -->
		<div class="grid gap-4" in:fly={{ y: 20, duration: 800, delay: 200 }}>
			<!-- Create Chat Button -->
			<Button
				class="w-full h-14 text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30"
				color="primary"
				onclick={handleNewChat}
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-spinner"></span>
				{:else}
					<Plus class="mr-2 size-5" />
					Start New Chat
				{/if}
			</Button>

			<!-- Last Chat Button -->
			{#if lastChat}
				<div class="relative group">
					<div
						class="absolute -inset-0.5 rounded-lg bg-linear-to-r from-primary to-secondary opacity-30 blur transition duration-1000 group-hover:opacity-70"
					></div>
					<a
						href={`/app/chats/${lastChat.id}`}
						class="relative flex items-center justify-between rounded-lg bg-base-100 px-6 py-4 shadow-sm transition hover:bg-base-50 text-left w-full"
					>
						<div class="flex items-center gap-3 overflow-hidden">
							<History class="size-5 text-base-content/50 shrink-0" />
							<div class="flex flex-col overflow-hidden">
								<span class="font-semibold text-base truncate">
									{lastChat.title || 'Untitled Chat'}
								</span>
								<span class="text-xs text-base-content/50">Continue where you left off</span>
							</div>
						</div>
						<ArrowRight
							class="size-5 text-base-content/30 transition-transform group-hover:translate-x-1"
						/>
					</a>
				</div>
			{/if}
		</div>

		<!-- Footer Note -->
		<p class="text-sm text-base-content/40 mt-8">
			Powered by AI • {new Date().getFullYear()}
		</p>
	</div>
</div>
