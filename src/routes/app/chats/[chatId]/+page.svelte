<script lang="ts">
	import { page } from '$app/state';
	import { MessagesRoleOptions, MessagesStatusOptions } from '$lib';

	import {
		chatsStore,
		messagesStore,
		Messages,
		MessageControls,
		ChatHeader,
		chatApi
	} from '$lib/apps/chat/client';
	import { userStore } from '$lib/apps/user/client';

	const chatId = $derived(page.params.chatId);
	const chat = $derived(chatsStore.chats.find((chat) => chat.id === chatId));
	const messages = $derived(messagesStore.messages);

	const aiSender = {
		id: 'ai',
		avatar: 'https://via.placeholder.com/150',
		name: 'AI',
		role: 'ai'
	};

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
</script>

{#if chat && messages}
	<div class="flex h-full w-full flex-col">
		<!-- Desktop Header with mode badge -->
		<div class="hidden md:block">
			<ChatHeader chatId={chat.id} />
		</div>

		<!-- Messages Area -->
		<div class="flex-1 overflow-hidden">
			<Messages class="h-full" {messages} userSender={userStore.sender} {aiSender} />
		</div>

		<!-- Footer / Input -->
		<footer class="shrink-0 border-t border-base-300 bg-base-100 p-2 pt-[0.4rem]">
			<MessageControls {messages} onSend={handleSend} />
		</footer>
	</div>
{:else}
	<div class="flex h-full items-center justify-center">
		<span class="loading loading-spinner loading-lg text-primary"></span>
	</div>
{/if}
