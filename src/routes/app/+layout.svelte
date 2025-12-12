<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Plus, Settings, Heart, MessageSquare, Menu, PanelRight } from 'lucide-svelte';
	import { MediaQuery, SvelteMap } from 'svelte/reactivity';

	import { chatApi, chatsStore, ChatHeader } from '$lib/apps/chat/client';
	import { uiStore, swipeable } from '$lib/shared/ui';
	import { userStore, subStore, FeedbackForm } from '$lib/apps/user/client';
	import { Button, Modal, ThemeController, AuthWall, Paywall, Sidebar } from '$lib/shared/ui';
	import { ChatsStatusOptions, PainsStatusOptions } from '$lib';

	import { painsStore } from '$lib/apps/pain/client';
	import type { AskMode } from '$lib/apps/pain/core';

	import UpdateApp from './UpdateApp.svelte';
	import Splash from './Splash.svelte';
	import { onMount } from 'svelte';

	const { children, data } = $props();
	const globalPromise = $derived(data.globalPromise);

	const user = $derived(userStore.user);
	const sub = $derived(subStore.sub);
	const sidebarOpen = $derived(uiStore.sidebarOpen);
	const sidebarExpanded = $derived(uiStore.sidebarExpanded);

	const mobile = $derived(new MediaQuery('(max-width: 768px)'));
	let layoutContainer: HTMLDivElement | null = $state(null);

	const chats = $derived(chatsStore.chats);
	const hasMoreChats = $derived(chatsStore.page < chatsStore.totalPages);
	const chatsLoading = $derived(chatsStore.loading);
	const chatModes = $derived.by(() => {
		const m = new SvelteMap<string, AskMode>();
		for (const chat of chats) {
			const pains = painsStore.getByChatId(chat.id);
			const validationPains = pains.filter((p) => p.status === PainsStatusOptions.validation);
			m.set(chat.id, validationPains.length > 0 ? 'validation' : 'discovery');
		}
		return m;
	});

	// Intersection observer for infinite scroll
	let loaderRef: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!loaderRef || !hasMoreChats) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !chatsLoading) {
					chatsStore.loadNextPage();
				}
			},
			{ threshold: 0.1 }
		);
		observer.observe(loaderRef);
		return () => observer.disconnect();
	});

	const discoveryChats = $derived(chats.filter((c) => chatModes.get(c.id) === 'discovery'));
	const validationChats = $derived(chats.filter((c) => chatModes.get(c.id) === 'validation'));

	// Chat page context detection
	const isChatPage = $derived(page.url.pathname.startsWith('/app/chats/'));
	const currentChatId = $derived(page.params.chatId);
	const currentChat = $derived(chats.find((c) => c.id === currentChatId));

	$effect(() => {
		globalPromise.then(({ user, sub, chatsRes, painsRes }) => {
			if (user) userStore.user = user;
			if (sub) subStore.sub = sub;
			if (chatsRes) {
				chatsStore.set(chatsRes.items, chatsRes.page, chatsRes.totalPages, chatsRes.totalItems);
			}
			if (painsRes) {
				painsStore.set(painsRes.items, painsRes.page, painsRes.totalPages, painsRes.totalItems);
			}
		});
	});

	$effect(() => {
		const userId = userStore.user?.id;
		if (!userId) return;
		userStore.subscribe(userId);
		chatsStore.subscribe(userId);
		painsStore.subscribe(userId);
		return () => {
			userStore.unsubscribe();
			chatsStore.unsubscribe();
			painsStore.unsubscribe();
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

	// Handle viewport changes on mobile to prevent layout shift when keyboard opens
	onMount(() => {
		if (typeof window === 'undefined' || !window.visualViewport) return;

		const handleResize = () => {
			// Only update layout if it's a chat page and the container is available
			if (!layoutContainer || !window.visualViewport || !isChatPage) return;

			if (mobile.current) {
				layoutContainer.style.height = `${window.visualViewport.height}px`;
			} else {
				layoutContainer.style.height = '';
			}
		};

		handleResize();

		window.visualViewport.addEventListener('resize', handleResize);

		return () => {
			window.visualViewport?.removeEventListener('resize', handleResize);
		};
	});

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
			<span class="font-semibold">HackSeeker</span>
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
			{#if validationChats.length > 0}
				{#if sidebarExpanded}
					<li class="menu-title text-nowrap">Validation Chats</li>
				{:else}
					<li class="divider"></li>
				{/if}
			{/if}
			{#each validationChats as chat (chat.id)}
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

			{#if discoveryChats.length > 0}
				{#if sidebarExpanded}
					<li class="menu-title text-nowrap">Discovery Chats</li>
				{:else}
					<li class="divider"></li>
				{/if}
			{/if}

			{#each discoveryChats as chat (chat.id)}
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

		<!-- Infinite scroll loader -->
		{#if hasMoreChats}
			<div bind:this={loaderRef} class="flex justify-center py-4">
				<span class="loading loading-spinner loading-sm"></span>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet sidebarFooter({ expanded }: { expanded: boolean })}
	<div class="divider my-1"></div>

	{#if user}
		<div class="mb-2 flex justify-center px-2">
			<button
				class={[
					'btn btn-ghost',
					expanded ? 'btn-block justify-start' : 'btn-square justify-center'
				]}
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
		bind:this={layoutContainer}
		class="flex h-screen flex-col overflow-hidden bg-base-100 md:flex-row"
		use:swipeable={{
			isOpen: sidebarOpen ?? false,
			direction: 'right',
			onOpen: () => uiStore.setSidebarOpen(true),
			onClose: () => uiStore.setSidebarOpen(false)
		}}
	>
		<!-- Mobile Header -->
		{#if isChatPage && currentChat}
			<div class="md:hidden">
				<ChatHeader chatId={currentChat.id} />
			</div>
		{:else}
			<header
				class="flex h-10 shrink-0 items-center justify-between border-b border-base-300 px-2 md:hidden"
			>
				<Button
					circle
					size="sm"
					variant="ghost"
					class="shrink-0 md:hidden"
					onclick={() => uiStore.setSidebarOpen(true)}
				>
					<Menu size={18} />
				</Button>
				<span></span>
				<span></span>
			</header>
		{/if}

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
			<div class="h-full max-w-[1440px]">
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

<UpdateApp />
