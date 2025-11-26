<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { page } from '$app/state';

	import { messagesStore, ChatControlPanel } from '$lib/apps/chat/client';
	import { uiStore, Sidebar, swipeable } from '$lib/shared/ui';

	const { children } = $props();

	const chatId = $derived(page.params.chatId!);
	const rightSidebarOpen = $derived(uiStore.rightSidebarOpen);

	$effect(() => {
		if (!chatId) return;

		messagesStore.load(chatId).then(() => {
			messagesStore.subscribe(chatId);
		});
		return () => {
			messagesStore.unsubscribe();
		};
	});

	const mobile = $derived(new MediaQuery('(max-width: 768px)'));
</script>

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
	<div class="h-full flex-1 overflow-hidden">
		{@render children()}
	</div>

	<!-- Desktop Right Sidebar (always visible on desktop) -->
	<aside class="hidden max-w-124 shrink-0 border-l border-base-300 md:flex md:flex-col">
		<ChatControlPanel {chatId} />
	</aside>

	<!-- Mobile Right Sidebar Drawer -->
	<Sidebar
		open={(mobile.current && rightSidebarOpen) ?? false}
		position="right"
		mobileWidth="w-72"
		showToggle={false}
		mobileOnly
		onclose={() => uiStore.setRightSidebarOpen(false)}
	>
		{#snippet children({ expanded })}
			<ChatControlPanel compact {chatId} />
		{/snippet}
	</Sidebar>
</div>
