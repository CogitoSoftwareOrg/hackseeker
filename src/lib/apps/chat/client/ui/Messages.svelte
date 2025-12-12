<script lang="ts">
	import { ChevronsDown } from 'lucide-svelte';
	import type { ClassValue } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	import { Button, scrollToBottom, type MessagesResponse } from '$lib';
	import type { Sender } from '$lib/apps/chat/core';

	import Message from './Message.svelte';
	import { onMount, tick } from 'svelte';

	interface Props {
		messages: MessagesResponse[];
		userSender: Sender;
		aiSender: Sender;
		class?: ClassValue;
		hasMore?: boolean;
		loading?: boolean;
		onLoadMore?: () => Promise<void>;
	}

	const {
		class: className,
		messages,
		userSender,
		aiSender,
		hasMore = false,
		loading = false,
		onLoadMore
	}: Props = $props();

	let messagesContainer: HTMLElement | null = $state(null);
	let loaderRef: HTMLDivElement | undefined = $state();
	let showScrollButton = $state(false);

	// Track first message ID to detect when older messages are loaded
	let prevFirstMsgId: string | null = $state(null);

	// Intersection observer for loading older messages (at top)
	$effect(() => {
		if (!loaderRef || !hasMore || !onLoadMore) return;

		const observer = new IntersectionObserver(
			async (entries) => {
				if (entries[0].isIntersecting && !loading) {
					// Save scroll position info before loading
					const container = messagesContainer;
					const scrollHeightBefore = container?.scrollHeight ?? 0;

					await onLoadMore();

					// Restore scroll position after DOM updates
					requestAnimationFrame(() => {
						if (container) {
							const scrollHeightAfter = container.scrollHeight;
							const diff = scrollHeightAfter - scrollHeightBefore;
							container.scrollTop = diff;
						}
					});
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(loaderRef);
		return () => observer.disconnect();
	});

	// Auto-scroll to bottom on new messages (but not when loading old ones)
	let lastLength = 0;
	$effect(() => {
		if (messages.length === 0) return;

		const firstMsgId = messages[0]?.id;
		const isLoadingOlder = prevFirstMsgId !== null && firstMsgId !== prevFirstMsgId;

		// Only auto-scroll for new messages at the end, not when loading older ones
		if (lastLength !== messages.length && !isLoadingOlder) {
			setTimeout(() => scrollToBottom(messagesContainer), 100);
		}

		lastLength = messages.length;
		prevFirstMsgId = firstMsgId;
	});

	function onscroll() {
		if (!messagesContainer) return;
		const { scrollTop, clientHeight, scrollHeight } = messagesContainer;
		const atBottom = scrollTop + clientHeight >= scrollHeight - 50;
		showScrollButton = !atBottom;
	}

	onMount(() => {
		setTimeout(() => scrollToBottom(messagesContainer), 100);
	});
</script>

<div class={[className, 'relative h-full bg-base-100']}>
	<div
		bind:this={messagesContainer}
		{onscroll}
		class={['flex h-full flex-col overflow-y-auto overscroll-contain scroll-smooth']}
	>
		<div class="mx-auto flex min-h-full w-full max-w-4xl flex-col space-y-3 px-2 pt-4 pb-4">
			{#if messages.length === 0}
				<div class="flex flex-1 flex-col items-center justify-center text-center opacity-50">
					<div class="filter mb-4 text-6xl grayscale">💬</div>
					<p class="text-lg font-medium">Start a conversation...</p>
				</div>
			{:else}
				<!-- Loader for older messages (at top) -->
				{#if hasMore}
					<div bind:this={loaderRef} class="flex justify-center py-2">
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
					</div>
				{/if}

				{#each messages as msg, index (msg.id)}
					{@const incoming = msg.role !== 'user'}
					{@const sender = incoming ? aiSender : userSender}
					<Message class={['w-full']} {msg} {incoming} {sender} showHeader={msg.role === 'user'} />
				{/each}
			{/if}
		</div>

		{#if showScrollButton}
			<div class="absolute right-8 bottom-4 z-10" transition:fade>
				<Button
					circle
					color="neutral"
					size="sm"
					class="opacity-80 shadow-lg hover:opacity-100"
					onclick={() => scrollToBottom(messagesContainer)}
				>
					<ChevronsDown size={16} />
				</Button>
			</div>
		{/if}
	</div>
</div>
