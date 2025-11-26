<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { Search, Filter, MessageSquare, ChevronRight } from 'lucide-svelte';
	import { chatsStore } from '$lib/apps/chat/client';
	import { Button } from '$lib/shared/ui';

	const chats = $derived(chatsStore.chats);

	let showFilters = $state(false);
	let searchQuery = $state('');

	const filteredChats = $derived(
		chats.filter((chat) => {
			if (!searchQuery) return true;
			const title = chat.title?.toLowerCase() || '';
			return title.includes(searchQuery.toLowerCase());
		})
	);

	function formatDate(dateString: string) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
	}
</script>

<div class="flex h-full w-full flex-col bg-base-100">
	<!-- Header -->
	<header class="flex flex-col border-b border-base-300 bg-base-100 px-4 py-2 shadow-sm z-10">
		<div class="flex items-center justify-between h-14">
			<h1 class="text-2xl font-bold">Chats</h1>
			<Button
				circle
				variant="ghost"
				onclick={() => (showFilters = !showFilters)}
				class={showFilters ? 'bg-base-200' : ''}
			>
				<Filter size={20} />
			</Button>
		</div>

		{#if showFilters}
			<div transition:slide class="pb-4">
				<div class="relative w-full">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Search class="size-5 text-base-content/50" />
					</div>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search chats..."
						class="input input-bordered w-full pl-10 rounded-xl"
					/>
				</div>
				<!-- Add more filters here if needed -->
			</div>
		{/if}
	</header>

	<!-- Chat List -->
	<div class="flex-1 overflow-y-auto p-4">
		{#if filteredChats.length === 0}
			<div class="flex h-64 flex-col items-center justify-center text-base-content/50">
				<MessageSquare size={48} class="mb-4 opacity-20" />
				<p>No chats found</p>
			</div>
		{:else}
			<div class="flex flex-col gap-2">
				{#each filteredChats as chat (chat.id)}
					<a
						href={`/app/chats/${chat.id}`}
						class="group card card-compact bg-base-100 shadow-sm border border-base-200 transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]"
					>
						<div class="card-body flex flex-row items-center gap-3">
							<div class="avatar placeholder">
								<div
									class="bg-primary/10 text-primary w-10 rounded-full flex items-center justify-center"
								>
									<span class="text-lg font-bold">
										{(chat.title || 'N').charAt(0).toUpperCase()}
									</span>
								</div>
							</div>
							<div class="flex-1 overflow-hidden">
								<h3 class="font-semibold truncate">
									{chat.title || 'New Chat'}
								</h3>
								<p class="text-xs text-base-content/60 truncate">
									{chat.id}
									<!-- Or last message preview if available -->
								</p>
							</div>
							<div class="flex flex-col items-end gap-1">
								<span class="text-xs text-base-content/40">
									{formatDate(chat.updated || chat.created)}
								</span>
								<ChevronRight
									size={16}
									class="text-base-content/30 group-hover:text-primary transition-colors"
								/>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
