<script lang="ts">
	import { onMount } from 'svelte';

	import favicon from '$lib/shared/assets/favicon_io/favicon.ico';

	onMount(() => {
		console.log('Popup mounted');
		const theme = localStorage.getItem('theme') || 'DARK';
		document.documentElement.setAttribute('data-theme', theme);
	});

	let count = $state(0);
</script>

<main class="min-w-[380px] min-h-[560px] p-4">
	<h3>Svelte Popup</h3>
	<button onclick={() => count++}>Clicked {count} times</button>
	<button
		onclick={() => {
			const theme = document.documentElement.getAttribute('data-theme') || 'DARK';
			document.documentElement.setAttribute('data-theme', theme === 'DARK' ? 'LIGHT' : 'DARK');
		}}
	>
		Toggle Theme
	</button>
	<img src={favicon} alt="Logo" class="w-10 h-10" />
	<p class="text-primary">Current theme: {document.documentElement.getAttribute('data-theme')}</p>
</main>
