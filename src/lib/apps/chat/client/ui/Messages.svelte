<script lang="ts">
	import { ChevronsDown } from 'lucide-svelte';
	import type { ClassValue } from 'svelte/elements';
	import { fade } from 'svelte/transition';

	import { Button, scrollToBottom, type MessagesResponse } from '$lib';
	import type { Sender } from '$lib/apps/chat/core';

	import Message from './Message.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	interface Props {
		messages: MessagesResponse[];
		userSender: Sender;
		aiSender: Sender;
		class?: ClassValue;
	}

	const { class: className, messages, userSender, aiSender }: Props = $props();

	let messagesContainer: HTMLElement | null = $state(null);
	let showScrollButton = $state(false);

	let loading = $state(false);
	afterNavigate(() => {
		loading = true;
		setTimeout(() => {
			loading = false;
		}, 500);
	});

	let lastLength = 0;
	$effect(() => {
		if (lastLength === messages.length) return;
		setTimeout(() => {
			scrollToBottom(messagesContainer);
			loading = false;
		}, 300);
		lastLength = messages.length;
	});

	function onscroll() {
		if (!messagesContainer) return;
		const { scrollTop, clientHeight, scrollHeight } = messagesContainer;
		const atBottom = scrollTop + clientHeight >= scrollHeight - 50; // Increased threshold
		showScrollButton = !atBottom;
	}

	onMount(() => {
		setTimeout(() => scrollToBottom(messagesContainer), 100);
	});
</script>

<div class={[className, 'relative h-full w-full min-w-0 bg-base-100']}>
	<div
		bind:this={messagesContainer}
		{onscroll}
		class={[
			'flex h-full w-full min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth'
		]}
	>
		<div
			class="mx-auto flex min-h-full w-full min-w-0 max-w-4xl flex-col space-y-3 px-1 sm:px-2 pt-10 pb-4"
		>
			{#if messages.length === 0}
				<div class="flex flex-1 flex-col items-center justify-center text-center opacity-50">
					<div class="filter mb-4 text-6xl grayscale">💬</div>
					<p class="text-lg font-medium">Start a conversation...</p>
				</div>
			{:else if loading}
				<div class="flex flex-1 flex-col items-center justify-center text-center opacity-50">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			{:else}
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
