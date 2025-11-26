<script lang="ts">
	import '../app.css';
	import '$lib/shared/pb/pb-hook';
	import favicon from '$lib/shared/assets/favicon_io/favicon.ico';
	import { PortalHost, ThemeLoad } from '$lib/shared/ui';

	import { onMount } from 'svelte';
	//@ts-ignore
	import { pwaInfo } from 'virtual:pwa-info';
	//@ts-ignore
	import { registerSW } from 'virtual:pwa-register';

	import Background from './Background.svelte';

	let { children } = $props();

	onMount(() => {
		const updateSW = registerSW({
			immediate: true,
			onRegisteredSW(url: string, reg: ServiceWorkerRegistration) {
				console.log('[PWA] registered:', url, reg);
			},
			onRegisterError(err: Error) {
				console.error('[PWA] register error:', err);
			},
			onNeedRefresh() {
				console.log('[PWA] need refresh');
			},
			onOfflineReady() {
				console.log('[PWA] offline ready');
			}
		});
	});

	//@ts-ignore
	const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
	{@html webManifestLink}
	<link rel="icon" href={favicon} />
	<ThemeLoad />
</svelte:head>

<Background />

<PortalHost />
{@render children()}
