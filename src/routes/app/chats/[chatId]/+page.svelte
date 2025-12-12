<script lang="ts">
	import { page } from '$app/state';
	import { Pencil, Check, X } from 'lucide-svelte';

	import { MessagesRoleOptions, MessagesStatusOptions } from '$lib';
	import {
		chatsStore,
		messagesStore,
		Messages,
		MessageControls,
		chatApi
	} from '$lib/apps/chat/client';
	import { userStore } from '$lib/apps/user/client';
	import { Button } from '$lib/shared/ui';

	const chatId = $derived(page.params.chatId);
	const chat = $derived(chatsStore.chats.find((chat) => chat.id === chatId));

	const messages = $derived(messagesStore.messages);
	const hasMoreMessages = $derived(messagesStore.page < messagesStore.totalPages);
	const messagesLoading = $derived(messagesStore.loading);

	async function handleLoadMore() {
		await messagesStore.loadNextPage();
	}

	const aiSender = {
		id: 'ai',
		avatar: 'https://via.placeholder.com/150',
		name: 'AI',
		role: 'ai'
	};

	let isEditingTitle = $state(false);
	let newTitle = $derived(chat?.title || '');

	async function handleSend(content: string) {
		if (!chat) return;
		await chatApi.sendMessage(
			{
				chat: chat.id,
				role: MessagesRoleOptions.user,
				status: MessagesStatusOptions.final,
				content
			},
			chat.pain ? 'validation' : 'discovery'
		);
	}

	async function saveTitle() {
		if (!chat) return;
		if (newTitle.trim() !== chat.title) {
			await chatApi.update(chat.id, { title: newTitle });
		}
		isEditingTitle = false;
	}

	function cancelEdit() {
		if (chat) newTitle = chat.title || '';
		isEditingTitle = false;
	}
</script>

{#if chat && messages}
	<div class="flex h-full w-full flex-col">
		<!-- Desktop Header with title editing -->
		<header
			class="hidden h-12 shrink-0 items-center justify-between border-b border-base-300 px-4 sm:flex"
		>
			<div class="flex flex-1 items-center gap-2 overflow-hidden">
				{#if isEditingTitle}
					<form
						onsubmit={(e) => {
							e.preventDefault();
							saveTitle();
						}}
						class="flex w-full max-w-md items-center gap-2"
					>
						<input type="text" class="input input-sm input-bordered w-full" bind:value={newTitle} />
						<Button circle size="sm" color="success" type="submit">
							<Check size={16} />
						</Button>
						<Button circle size="sm" variant="ghost" onclick={cancelEdit}>
							<X size={16} />
						</Button>
					</form>
				{:else}
					<h1 class="truncate text-lg font-bold">{chat.title || 'New Chat'}</h1>
					<Button
						circle
						size="sm"
						variant="ghost"
						class="transition-opacity hover:bg-base-200"
						onclick={() => {
							isEditingTitle = true;
							newTitle = chat.title || '';
						}}
					>
						<Pencil size={14} class="text-base-content/70" />
					</Button>
				{/if}
			</div>
		</header>

		<!-- Messages Area -->
		<div class="flex-1 overflow-hidden">
			<Messages
				class="h-full"
				{messages}
				userSender={userStore.sender}
				{aiSender}
				hasMore={hasMoreMessages}
				loading={messagesLoading}
				onLoadMore={handleLoadMore}
			/>
		</div>

		<!-- Footer / Input -->
		{#if chatId}
			<footer class="shrink-0 border-t border-base-300 bg-base-100 p-2 pt-[0.4rem]">
				<MessageControls {chatId} {messages} onSend={handleSend} />
			</footer>
		{/if}
	</div>
{:else}
	<div class="flex h-full items-center justify-center">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{/if}
