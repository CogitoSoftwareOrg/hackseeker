<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { page } from '$app/state';

	import { chatsStore, messagesStore, ChatControlPanel } from '$lib/apps/chat/client';
	import { uiStore, Sidebar, swipeable } from '$lib/shared/ui';
	import { artifactsStore } from '$lib/apps/artifact/client';
	import { searchQueriesStore } from '$lib/apps/search/client';

	const { children } = $props();

	const chat = $derived(chatsStore.chats.find((c) => c.id === page.params.chatId));
	const rightSidebarOpen = $derived(uiStore.rightSidebarOpen);

	$effect(() => {
		if (!chat) return;

		messagesStore.load(chat.id).then(() => {
			messagesStore.subscribe(chat.id);
		});

		if (chat.pain) {
			artifactsStore.loadByPainId(chat.pain).then(() => {
				artifactsStore.subscribe(chat.pain);
			});
			searchQueriesStore.loadByPainId(chat.pain).then(() => {
				searchQueriesStore.subscribe(chat.pain);
			});
		}
		return () => {
			messagesStore.unsubscribe();
			artifactsStore.unsubscribe();
			searchQueriesStore.unsubscribe();
		};
	});

	const mobile = $derived(new MediaQuery('(max-width: 768px)'));
</script>

{#if chat}
	<div
		class="flex h-full w-full"
		use:swipeable={{
			isOpen: rightSidebarOpen ?? false,
			direction: 'left',
			edgeWidth: 30,
			onOpen: () => uiStore.setRightSidebarOpen(true),
			onClose: () => uiStore.setRightSidebarOpen(false)
		}}
	>
		<div class="h-full flex-5 overflow-hidden">
			{@render children()}
		</div>

		<!-- Desktop Right Sidebar (always visible on desktop) -->
		<aside class="hidden flex-4 shrink-0 border-l border-base-300 md:flex md:flex-col">
			<ChatControlPanel {chat} />
		</aside>

		<!-- Mobile Right Sidebar Drawer -->
		<Sidebar
			open={(mobile.current && rightSidebarOpen) ?? false}
			position="right"
			mobileWidth="w-96 max-w-[calc(100vw-2rem)]"
			showToggle={false}
			mobileOnly
			onclose={() => uiStore.setRightSidebarOpen(false)}
		>
			{#snippet children({ expanded })}
				<ChatControlPanel compact {chat} />
			{/snippet}
		</Sidebar>
	</div>
{/if}
