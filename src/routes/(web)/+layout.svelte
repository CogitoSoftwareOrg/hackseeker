<script lang="ts">
	import { Menu, Heart } from 'lucide-svelte';
	import ThemeController from '$lib/shared/ui/ThemeController.svelte';

	let { children } = $props();
</script>

<div class="drawer drawer-end">
	<input id="mobile-drawer" type="checkbox" class="drawer-toggle" />

	<!-- Main Content -->
	<div class="drawer-content flex min-h-screen flex-col">
		<!-- Transparent Header -->
		<header class="fixed top-0 z-50 w-full transition-all duration-300">
			<div
				class="absolute inset-0 border-b border-base-content/5 bg-base-100/70 backdrop-blur-xl"
			></div>
			<nav class="relative container mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 items-center justify-between">
					<!-- Logo -->
					<a href="/" class="group flex items-center gap-2 text-xl font-black tracking-tight">
						<div class="relative">
							<Heart
								class="size-8 text-primary transition-transform duration-300 group-hover:scale-110"
							/>
							<div
								class="absolute inset-0 bg-primary/50 opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100"
							></div>
						</div>
						<span class="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent"
							>HackSeeker</span
						>
					</a>

					<!-- Desktop Navigation -->
					<div class="hidden md:flex md:items-center md:gap-8">
						<div class="flex items-center gap-4">
							<ThemeController />
							<a
								href="/app/auth/sign-up"
								class="btn border-none shadow-[0_0_20px_-5px_var(--color-primary)] transition-all duration-300 btn-primary hover:shadow-[0_0_30px_-5px_var(--color-primary)]"
							>
								Get Started Free
							</a>
						</div>
					</div>

					<!-- Mobile Menu Button -->
					<label
						for="mobile-drawer"
						class="drawer-button btn btn-square btn-ghost md:hidden"
						aria-label="Toggle menu"
					>
						<Menu class="h-6 w-6" />
					</label>
				</div>
			</nav>
		</header>

		<!-- Main Content -->
		<main class="flex-1 pt-16">
			{@render children()}
		</main>

		<!-- Footer -->
		<footer
			class="footer border-t border-base-content/5 bg-base-200/50 p-10 text-base-content backdrop-blur-sm md:footer-horizontal"
		>
			<nav>
				<h6 class="footer-title opacity-50">Legal</h6>
				<a
					href="/legal/terms-and-conditions"
					class="link link-hover transition-colors hover:text-primary">Terms & Conditions</a
				>
				<a href="/legal/privacy-policy" class="link link-hover transition-colors hover:text-primary"
					>Privacy Policy</a
				>
			</nav>
			<aside>
				<div class="mb-2 flex items-center gap-2 font-bold">
					<Heart class="size-5 text-primary" />
					<span>HackSeeker</span>
				</div>
				<p class="text-base-content/60">© 2025 HackSeeker. All rights reserved.</p>
			</aside>
		</footer>
	</div>

	<!-- Mobile Sidebar -->
	<div class="drawer-side z-50">
		<label for="mobile-drawer" aria-label="close sidebar" class="drawer-overlay backdrop-blur-sm"
		></label>
		<aside
			class="min-h-full w-80 border-l border-base-content/5 bg-base-100/95 p-6 backdrop-blur-xl"
		>
			<div class="mb-8 flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Heart class="h-6 w-6 text-primary" />
					<span
						class="bg-linear-to-r from-primary to-secondary bg-clip-text text-xl font-black text-transparent"
						>HackSeeker</span
					>
				</div>
				<label for="mobile-drawer" class="btn btn-square btn-ghost btn-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/></svg
					>
				</label>
			</div>

			<nav class="flex flex-col gap-6">
				<div class="flex flex-col gap-4">
					<div class="flex items-center justify-between rounded-2xl bg-base-200/50 p-4">
						<span class="font-medium">Theme</span>
						<ThemeController />
					</div>

					<a
						href="/app/auth/sign-up"
						class="btn w-full border-none shadow-[0_0_20px_-5px_var(--color-primary)] btn-lg btn-primary"
					>
						Get Started
					</a>
				</div>

				<div class="divider my-2 opacity-50"></div>

				<div class="flex flex-col gap-4">
					<h3 class="px-2 text-xs font-bold tracking-wider uppercase opacity-50">Legal</h3>
					<a
						href="/legal/terms-and-conditions"
						class="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-base-200/50"
					>
						<span class="text-base-content/80">Terms & Conditions</span>
					</a>
					<a
						href="/legal/privacy-policy"
						class="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-base-200/50"
					>
						<span class="text-base-content/80">Privacy Policy</span>
					</a>
				</div>
			</nav>
		</aside>
	</div>
</div>
