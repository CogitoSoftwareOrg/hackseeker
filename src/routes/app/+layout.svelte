<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Plus, Settings, Heart, MessageSquare, Menu, PanelRight } from 'lucide-svelte';

	import { chatApi, chatsStore } from '$lib/apps/chat/client';
	import { uiStore, swipeable } from '$lib/shared/ui';
	import { userStore, subStore, FeedbackForm } from '$lib/apps/user/client';
	import { Button, Modal, ThemeController, AuthWall, Paywall, Sidebar } from '$lib/shared/ui';
	import { ChatsStatusOptions } from '$lib';

	import Splash from './Splash.svelte';

	const { children, data } = $props();
	const globalPromise = $derived(data.globalPromise);

	const user = $derived(userStore.user);
	const sub = $derived(subStore.sub);
	const sidebarOpen = $derived(uiStore.sidebarOpen);
	const sidebarExpanded = $derived(uiStore.sidebarExpanded);

	const chats = $derived(chatsStore.chats);

	// Chat page context detection
	const isChatPage = $derived(page.url.pathname.startsWith('/app/chats/'));
	const currentChatId = $derived(page.params.chatId);
	const currentChat = $derived(chats.find((c) => c.id === currentChatId));

	$effect(() => {
		globalPromise.then(({ user, sub, chats }) => {
			if (user) userStore.user = user;
			if (sub) subStore.sub = sub;
			if (chats) chatsStore.set(chats);
		});
	});

	$effect(() => {
		const userId = userStore.user?.id;
		if (!userId) return;
		userStore.subscribe(userId);
		chatsStore.subscribe(userId);
		return () => {
			userStore.unsubscribe();
			chatsStore.unsubscribe();
		};
	});

	$effect(() => {
		const subId = subStore.sub?.id;
		if (!subId) return;
		subStore.subscribe(subId);
		return () => subStore.unsubscribe();
	});

	// Close mobile sidebar on navigation
	afterNavigate(() => {
		uiStore.setSidebarOpen(false);
	});

	function isActive(path: string) {
		return page.url.pathname === path;
	}

	let loading = $state(false);
	async function handleNewChat() {
		if (!user) return uiStore.setAuthWallOpen(true);
		let emptyChat = chatsStore.getEmpty();

		if (!emptyChat) {
			loading = true;
			emptyChat = await chatApi.create({
				title: 'New Chat',
				status: ChatsStatusOptions.empty,
				user: user.id
			});
			loading = false;
		}

		goto(`/app/chats/${emptyChat.id}`);
	}
</script>

{#snippet sidebarHeader({ expanded }: { expanded: boolean })}
	{#if expanded}
		<a href="/app" class="flex items-center gap-2">
			<Heart class="size-6 text-primary" />
			<span class="font-semibold">MVP Template</span>
		</a>
	{/if}
{/snippet}

{#snippet sidebarContent({ expanded }: { expanded: boolean })}
	<div class="shrink-0 px-2 pt-4">
		<Button block class="rounded-xl" disabled={loading} square={!expanded} onclick={handleNewChat}>
			<Plus class="size-5" />
			{#if expanded}
				<span class="text-nowrap">New Chat</span>
			{/if}
		</Button>
	</div>

	<div class="divider my-2"></div>

	<div class="flex-1 overflow-y-auto px-2">
		<ul class="menu w-full gap-1">
			{#each chats as chat (chat.id)}
				<li class="w-full">
					<a
						href={`/app/chats/${chat.id}`}
						class={[
							'btn flex w-full items-center gap-2 rounded-xl btn-ghost transition-all',
							expanded ? 'justify-start px-4' : 'justify-center',
							isActive(`/app/chats/${chat.id}`) ? 'btn-soft' : ''
						]}
						title={!expanded ? chat.title || chat.id : ''}
					>
						{chat.id.slice(0, 2)}.
						{#if expanded}
							<span class="truncate font-medium">{chat.title || chat.id}</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</div>
{/snippet}

{#snippet sidebarFooter({ expanded }: { expanded: boolean })}
	<div class="divider my-1"></div>

	{#if user}
		<div class="mb-2 flex justify-center px-2">
			<button
				class={['btn justify-start btn-ghost', expanded ? 'btn-block' : 'btn-square']}
				onclick={() => uiStore.toggleFeedbackModal()}
			>
				<MessageSquare class={expanded ? 'size-5' : 'size-6'} />
				{#if expanded}
					Feedback
				{:else}
					<span class="sr-only">Feedback</span>
				{/if}
			</button>
		</div>
	{/if}

	<div class={['mb-2 border-base-300', expanded ? 'px-2' : 'flex justify-center']}>
		<ThemeController {expanded} navStyle />
	</div>

	<div class="border-t border-base-300">
		{#if user}
			<a
				href="/app/settings"
				class={[
					'flex items-center gap-3 p-2 transition-colors hover:bg-base-200',
					!expanded && 'justify-center'
				]}
				title={!expanded ? 'Settings' : ''}
			>
				{#if userStore.avatarUrl}
					<img src={userStore.avatarUrl} alt={user.name} class="size-10 rounded-full" />
				{:else}
					<div class="flex size-10 items-center justify-center rounded-full bg-base-300">
						{user.name?.at(0)?.toUpperCase() ?? 'U'}
					</div>
				{/if}
				{#if expanded}
					<div class="flex-1 overflow-hidden">
						<div class="truncate text-sm font-semibold">{user.name || 'User'}</div>
						<div class="truncate text-xs opacity-60">{user.email}</div>
					</div>
					<Settings class="size-5 opacity-60" />
				{/if}
			</a>
		{:else}
			<a
				href="/app/auth/sign-up"
				class={[
					'flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-base-300',
					!expanded && 'justify-center'
				]}
				title={!expanded ? 'Log in' : ''}
			>
				<div class="size-10 rounded-full bg-base-300"></div>
				{#if expanded}
					<div class="flex-1 overflow-hidden">
						<div class="truncate text-sm font-semibold">Log in</div>
					</div>
				{/if}
			</a>
		{/if}
	</div>
{/snippet}

{#await globalPromise}
	<Splash />
{:then}
	<div
		class="flex h-screen flex-col overflow-hidden bg-base-100 md:flex-row"
		use:swipeable={{
			isOpen: sidebarOpen ?? false,
			direction: 'right',
			onOpen: () => uiStore.setSidebarOpen(true),
			onClose: () => uiStore.setSidebarOpen(false)
		}}
	>
		<!-- Mobile Header -->
		<header
			class="flex h-10 shrink-0 items-center justify-between border-b border-base-300 px-2 md:hidden"
		>
			<Button
				color="neutral"
				circle
				size="sm"
				onclick={() => uiStore.setSidebarOpen(true)}
				variant="ghost"
			>
				<Menu class="size-6" />
			</Button>

			{#if isChatPage && currentChat}
				<h1 class="truncate px-2 text-sm font-semibold">{currentChat.title || 'New Chat'}</h1>
			{:else}
				<span></span>
			{/if}

			{#if isChatPage}
				<Button
					color="neutral"
					circle
					size="sm"
					onclick={() => uiStore.toggleRightSidebar()}
					variant="ghost"
				>
					<PanelRight class="size-5" />
				</Button>
			{:else}
				<span></span>
			{/if}
		</header>

		<!-- Sidebar -->
		<Sidebar
			open={sidebarOpen ?? false}
			expanded={sidebarExpanded ?? true}
			position="left"
			header={sidebarHeader}
			footer={sidebarFooter}
			onclose={() => uiStore.setSidebarOpen(false)}
			ontoggle={() => uiStore.toggleSidebarExpanded()}
		>
			{#snippet children({ expanded })}
				{@render sidebarContent({ expanded })}
			{/snippet}
		</Sidebar>

		<!-- Main Content -->
		<main class="flex-1 overflow-hidden">
			<div class="mx-auto h-full max-w-7xl p-0 md:px-4 lg:px-6">
				{@render children()}
			</div>
		</main>
	</div>
{/await}

<Modal
	class="max-h-[90vh] max-w-[90vw] sm:max-h-[95vh]"
	backdrop
	open={uiStore.paywallOpen}
	onclose={() => uiStore.setPaywallOpen(false)}
>
	<Paywall stripePrices={(data as any)?.stripePrices ?? []} />
</Modal>

<Modal
	class="max-w-md"
	backdrop
	open={uiStore.authWallOpen}
	onclose={() => uiStore.setAuthWallOpen(false)}
>
	<AuthWall />
</Modal>

<Modal
	class="max-w-2xl"
	backdrop
	open={uiStore.feedbackModalOpen}
	onclose={() => uiStore.setFeedbackModalOpen(false)}
>
	<FeedbackForm />
</Modal>
