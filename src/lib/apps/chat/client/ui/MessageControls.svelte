<script lang="ts">
	import { Send, Paperclip } from 'lucide-svelte';
	import type { ClassValue } from 'svelte/elements';
	import { MediaQuery } from 'svelte/reactivity';

	import { Button } from '$lib/shared/ui';
	import {
		// SourcesStatusOptions,
		type MessagesResponse
	} from '$lib';
	// import { sourceApi, SourceWidget } from '$lib/apps/source/client';
	// import { sourcesStore } from '$lib/apps/source/client';
	// import { userStore } from '$lib/apps/user/client';

	// const MAX_ATTACHMENTS = 5;

	interface Props {
		chatId: string;
		messages: MessagesResponse[];
		disabled?: boolean;
		class?: ClassValue;
		onSend: (content: string, sourceIds: string[]) => void | Promise<void>;
	}

	const { chatId, messages, disabled = false, class: className, onSend }: Props = $props();

	// const sources = $derived(sourcesStore.sources);
	// const user = $derived(userStore.user);

	let content = $state('');
	let isSending = $state(false);
	let textareaElement: HTMLTextAreaElement | undefined = $state();
	let fileInputElement: HTMLInputElement | undefined = $state();

	// Get the actual source objects from the store
	// const attachedSources = $derived(
	// 	sources.filter(
	// 		(s) => (s.metadata as any)?.chatId === chatId && s.status !== SourcesStatusOptions.used
	// 	)
	// );
	// const uploadingSources = $derived(
	// 	attachedSources.filter((s) => s.status !== SourcesStatusOptions.indexed)
	// );

	// // Check if all attached sources are indexed
	// const allSourcesReady = $derived(
	// 	attachedSources.length === 0 ||
	// 		attachedSources.every((s) => s.status === SourcesStatusOptions.indexed)
	// );

	// // Check if any source has error
	// const hasSourceError = $derived(
	// 	attachedSources.some((s) => s.status === SourcesStatusOptions.error)
	// );

	// Check if any files are still uploading
	// const isUploading = $derived(uploadingSources.length > 0);

	// Constants for autogrow behavior
	const MIN_HEIGHT = 24; // ~1 line
	const MAX_HEIGHT = 200; // ~10 lines

	const canSend = $derived.by(() => {
		if (!content.trim()) return false;
		if (isSending) return false;
		// if (isUploading) return false;
		// if (!allSourcesReady) return false;
		// if (hasSourceError) return false;

		if (messages.length === 0) return true;
		const lastMessage = messages[messages.length - 1];
		return lastMessage.role === 'ai' && lastMessage.status === 'final';
	});

	// const canAttach = $derived(attachedSources.length < MAX_ATTACHMENTS && !disabled && !isSending);

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

	function handleAttachClick() {
		fileInputElement?.click();
	}

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files?.length) return;

		// const remainingSlots = MAX_ATTACHMENTS - attachedSources.length;
		// const filesToAdd = Array.from(files).slice(0, remainingSlots);

		// Upload files in parallel
		// await Promise.all(
		// 	filesToAdd.map(async (file) => {
		// 		try {
		// 			await sourceApi.addSource(
		// 				{ title: file.name, user: user?.id, metadata: { chatId } },
		// 				file
		// 			);
		// 		} catch (error) {
		// 			console.error('Failed to upload file:', error);
		// 		} finally {
		// 		}
		// 	})
		// );

		// Reset input
		input.value = '';
	}

	function handleRemoveSource(sourceId: string) {
		console.log('remove source', sourceId);
	}

	async function handleSend() {
		if (!canSend) return;

		isSending = true;
		try {
			await onSend(
				content.trim(),
				// attachedSources.map((s) => s.id)
				[]
			);
			content = '';

			if (textareaElement) textareaElement.style.height = `${MIN_HEIGHT}px`;
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			isSending = false;
		}
	}

	const mobile = $derived(new MediaQuery('(max-width: 768px)'));

	function handleKeydown(e: KeyboardEvent) {
		// On mobile, Enter creates new line; on desktop, Enter sends (Shift+Enter for new line)
		if (e.key === 'Enter' && !e.shiftKey && !mobile.current) {
			e.preventDefault();
			handleSend();
		}
	}
</script>

<div class={['mx-auto w-full max-w-3xl', className]}>
	<!-- Attached sources and uploading files -->
	<!-- {#if attachedSources.length > 0 || uploadingSources.length > 0}
		<div class="mb-2 flex flex-wrap gap-2">
			{#each attachedSources as source (source.id)}
				<SourceWidget {source} onRemove={handleRemoveSource} />
			{/each}
		</div>
	{/if} -->

	<div class={['flex items-end gap-1 border rounded-3xl', canSend ? 'border-primary' : '']}>
		<!-- Hidden file input -->
		<input
			bind:this={fileInputElement}
			type="file"
			multiple
			accept=".pdf,.doc,.docx,.txt,.md,.csv,.json,.xml"
			onchange={handleFileSelect}
			class="hidden"
		/>

		<!-- Attach button -->
		<Button
			color="neutral"
			variant="ghost"
			circle
			onclick={handleAttachClick}
			disabled={disabled || isSending}
			class="shrink-0"
		>
			<Paperclip class="size-5" />
		</Button>

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
