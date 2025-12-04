<script lang="ts">
	import { Pencil, Check, X, Menu, Lightbulb, Search, PanelRight } from 'lucide-svelte';

	import { chatsStore, chatApi } from '$lib/apps/chat/client';
	import type { AskMode } from '$lib/apps/pain/core';
	import { Button, uiStore } from '$lib/shared/ui';

	interface Props {
		chatId: string;
		class?: string;
	}

	let { chatId, class: className = '' }: Props = $props();

	const chat = $derived(chatsStore.chats.find((c) => c.id === chatId));

	const mode: AskMode = $derived(chat?.pain ? 'validation' : 'discovery');

	let isEditingTitle = $state(false);
	let editedTitle = $state('');

	async function saveTitle() {
		if (!chat) return;
		if (editedTitle.trim() !== chat.title) {
			await chatApi.update(chat.id, { title: editedTitle });
		}
		isEditingTitle = false;
	}

	function cancelEdit() {
		isEditingTitle = false;
	}

	function startEdit() {
		if (chat) {
			editedTitle = chat.title || '';
			isEditingTitle = true;
		}
	}

	function toggleRightSidebar() {
		uiStore.setRightSidebarOpen(!uiStore.rightSidebarOpen);
	}

	function toggleLeftSidebar() {
		uiStore.setSidebarOpen(!uiStore.sidebarOpen);
	}
</script>

{#if chat}
	<header
		class={[
			'flex h-12 shrink-0 items-center justify-between border-b border-base-300 px-3 sm:px-4',
			className
		]}
	>
		<!-- Left side: Burger menu (mobile) + Mode badge + Title -->
		<div class="flex flex-1 items-center gap-2 overflow-hidden">
			<!-- Burger menu for global sidebar (mobile only) -->
			<Button
				circle
				size="sm"
				variant="ghost"
				class="shrink-0 md:hidden"
				onclick={toggleLeftSidebar}
			>
				<Menu size={18} />
			</Button>

			<!-- Mode Badge -->
			<div
				class={[
					'flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1',
					mode === 'discovery' ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary'
				]}
			>
				{#if mode === 'discovery'}
					<Lightbulb size={12} />
					<span class="hidden text-xs font-medium sm:inline">Discovery</span>
				{:else}
					<Search size={12} />
					<span class="hidden text-xs font-medium sm:inline">Validation</span>
				{/if}
			</div>

			<!-- Title with edit functionality -->
			{#if isEditingTitle}
				<form
					onsubmit={(e) => {
						e.preventDefault();
						saveTitle();
					}}
					class="flex flex-1 items-center gap-2"
				>
					<input
						type="text"
						class="input input-sm input-bordered w-full max-w-xs"
						bind:value={editedTitle}
					/>
					<Button circle size="sm" color="success" type="submit">
						<Check size={14} />
					</Button>
					<Button circle size="sm" variant="ghost" onclick={cancelEdit}>
						<X size={14} />
					</Button>
				</form>
			{:else}
				<div class="flex min-w-0 flex-1 items-center gap-1">
					<h1 class="truncate text-sm font-semibold sm:text-base">{chat.title || 'New Chat'}</h1>
					<Button
						circle
						size="xs"
						variant="ghost"
						class="shrink-0 opacity-60 transition-opacity hover:opacity-100"
						onclick={startEdit}
					>
						<Pencil size={12} class="text-base-content/70" />
					</Button>
				</div>
			{/if}

			{#if mode === 'validation'}
				<Button
					target="_blank"
					size="sm"
					variant="soft"
					href="https://cogitosoftware.nl/mvp-offer"
					class="hidden md:block">Build MVP in a 7 days</Button
				>
			{/if}
		</div>

		<!-- Right side: Right sidebar toggle (mobile only) -->
		<div class="flex items-center gap-2 md:hidden">
			<Button circle size="sm" variant="ghost" onclick={toggleRightSidebar}>
				<PanelRight size={18} />
			</Button>
		</div>
	</header>
{/if}
