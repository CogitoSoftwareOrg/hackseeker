<script lang="ts">
	// @ts-ignore
	import { DateTime } from 'luxon';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import type { ClassValue } from 'svelte/elements';

	import type { MessagesResponse } from '$lib';
	import type { Sender } from '$lib/apps/chat/core';

	interface Props {
		class?: ClassValue;
		incoming: boolean;
		msg: MessagesResponse;
		sender: Sender;
		showHeader?: boolean;
	}

	const { msg, incoming, class: className = '', sender, showHeader = true }: Props = $props();

	// TIME
	const utcTs = $derived(
		DateTime.fromFormat(msg.created || '', "yyyy-MM-dd HH:mm:ss.SSS'Z'", {
			zone: 'utc'
		})
	);

	const localTs = $derived(utcTs.isValid ? utcTs.toLocal() : utcTs);
	const formattedTime = $derived(localTs.isValid ? localTs.toFormat('h:mm a') : '');

	const rawHtml = $derived(marked.parse(msg.content || ''));
	const safeHtml = $derived(
		DOMPurify.sanitize(rawHtml as string, {
			ADD_ATTR: ['target', 'rel']
		})
	);

	const isWaitingForResponse = $derived(
		incoming && msg.content.trim() === '' && msg.status === 'streaming'
	);
</script>

<div class={['group flex w-full gap-4 px-4 py-2', incoming ? '' : 'flex-row-reverse', className]}>
	<!-- Avatar -->
	<div class="flex shrink-0 flex-col items-center gap-1">
		{#if showHeader}
			{#if sender.avatar}
				<div class="avatar">
					<div class="size-10 overflow-hidden rounded-full ring-1 ring-base-300 ring-offset-1">
						<img alt={msg.role} src={sender.avatar} class="h-full w-full object-cover" />
					</div>
				</div>
			{:else}
				<div class="size-10 rounded-full bg-base-300 text-center flex items-center justify-center">
					{sender.name?.at(0)?.toUpperCase() ?? 'U'}
				</div>
			{/if}
			<!-- {:else}
			<div class="size-10"></div> -->
		{/if}
	</div>

	<!-- Message Content -->
	<div class={['flex min-w-0 max-w-full flex-col', incoming ? 'items-start' : 'items-end']}>
		<!-- Header (Name) -->
		{#if showHeader}
			<div class="mb-1 flex items-center gap-2 px-1">
				<span class="text-sm font-semibold text-base-content">
					{sender?.name || 'Unknown'}
				</span>
				{#if formattedTime}
					<time
						datetime={msg.created}
						class="text-xs text-base-content/40 opacity-0 transition-opacity group-hover:opacity-100"
					>
						{formattedTime}
					</time>
				{/if}
			</div>
		{/if}

		<!-- Bubble -->
		<div
			class={[
				'relative prose min-w-0 max-w-full overflow-hidden rounded-2xl px-3 py-3 text-base leading-relaxed shadow-sm transition-all',
				incoming
					? 'rounded-tl-none bg-base-200 text-base-content'
					: 'rounded-tr-none bg-primary text-primary-content',

				// текущие стили:
				'[&_p]:m-0 [&_p]:min-h-[1em]',
				'[&_a]:underline [&_a]:decoration-current/30 [&_a]:underline-offset-2 hover:[&_a]:decoration-current',
				'[&_code]:rounded-md [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm',

				// ВАЖНО: отдельная настройка для блочных код-блоков
				// <pre> + <code> внутри
				'[&_pre]:my-2 [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3',
				'[&_pre]:bg-base-300 [&_pre]:text-base-content', // нормальный контраст
				'[&_pre_code]:bg-transparent [&_pre_code]:text-base-content',

				// Таблицы: делаем scrollable в рамках сообщения
				'[&_table]:my-2 [&_table]:border-collapse [&_table]:w-full',
				'[&_table_th]:border [&_table_th]:border-base-300 [&_table_th]:px-2 [&_table_th]:py-1 [&_table_th]:text-left [&_table_th]:font-semibold',
				'[&_table_td]:border [&_table_td]:border-base-300 [&_table_td]:px-2 [&_table_td]:py-1'
			]}
		>
			{#if isWaitingForResponse}
				<div class="flex items-center gap-1 py-2">
					<span
						class="h-2 w-2 animate-bounce rounded-full bg-current opacity-60"
						style="animation-delay: 0ms"
					></span>
					<span
						class="h-2 w-2 animate-bounce rounded-full bg-current opacity-60"
						style="animation-delay: 150ms"
					></span>
					<span
						class="h-2 w-2 animate-bounce rounded-full bg-current opacity-60"
						style="animation-delay: 300ms"
					></span>
				</div>
			{:else}
				<div class="min-w-0 max-w-full overflow-x-auto -mx-3 px-3">
					{@html safeHtml}
				</div>
			{/if}
		</div>
	</div>
</div>
