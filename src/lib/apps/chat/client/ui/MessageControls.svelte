<script lang="ts">
	import { Send, Sparkles } from 'lucide-svelte';
	import type { ClassValue } from 'svelte/elements';

	import { Button } from '$lib/shared/ui';
	import type { MessagesResponse } from '$lib';

	interface Props {
		messages: MessagesResponse[];
		disabled?: boolean;
		class?: ClassValue;
		onSend: (content: string) => void | Promise<void>;
	}

	const { messages, disabled = false, class: className, onSend }: Props = $props();

	let content = $state('');
	let isSending = $state(false);
	let textareaElement: HTMLTextAreaElement | undefined = $state();

	// Constants for autogrow behavior
	const MIN_HEIGHT = 24; // ~1 line
	const MAX_HEIGHT = 200; // ~10 lines

	const canSend = $derived.by(() => {
		if (!content.trim()) return false;
		if (isSending) return false;

		if (messages.length === 0) return true;
		const lastMessage = messages[messages.length - 1];
		return lastMessage.role === 'ai' && lastMessage.status === 'final';
	});

	// Auto-resize textarea based on content
	function adjustTextareaHeight() {
		if (!textareaElement) return;

		// Reset height to auto to get accurate scrollHeight
		textareaElement.style.height = 'auto';

		// Calculate new height based on scrollHeight
		const scrollHeight = textareaElement.scrollHeight;
		const newHeight = Math.min(Math.max(scrollHeight, MIN_HEIGHT), MAX_HEIGHT);

		textareaElement.style.height = `${newHeight}px`;

		// Enable scrolling if content exceeds max height
		textareaElement.style.overflowY = scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
	}

	// Adjust height when content changes
	$effect(() => {
		if (content !== undefined) {
			// Use requestAnimationFrame to ensure DOM is updated
			requestAnimationFrame(() => {
				adjustTextareaHeight();
			});
		}
	});

	// Adjust height on input (for paste, etc.)
	function handleInput() {
		adjustTextareaHeight();
	}

	async function handleSend() {
		if (!canSend) return;

		isSending = true;
		try {
			await onSend(content.trim());
			content = '';
			if (textareaElement) textareaElement.style.height = `${MIN_HEIGHT}px`;
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			isSending = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}
</script>

<div class={['mx-auto w-full max-w-3xl', className]}>
	<div class={['flex items-end gap-2 border rounded-3xl pl-4', canSend ? 'border-primary' : '']}>
		<textarea
			bind:this={textareaElement}
			bind:value={content}
			onkeydown={handleKeydown}
			oninput={handleInput}
			placeholder="Type a message..."
			class="border-none textarea w-full resize-none text-base textarea-primary focus:outline-none"
			style="min-height: {MIN_HEIGHT}px; max-height: {MAX_HEIGHT}px;"
			rows="1"
			disabled={disabled || isSending}
		></textarea>

		<Button
			circle
			onclick={handleSend}
			size="md"
			color="primary"
			disabled={disabled || !canSend}
			class="shrink-0"
		>
			{#if isSending}
				<span class="loading loading-sm loading-spinner"></span>
			{:else}
				<Send class="size-5 {canSend ? 'ml-0.5' : ''}" />
			{/if}
		</Button>
	</div>
	<div class="mt-2 text-center text-xs text-base-content/40 hidden">
		<p>AI can make mistakes. Treat everything it says as fiction.</p>
	</div>
</div>
