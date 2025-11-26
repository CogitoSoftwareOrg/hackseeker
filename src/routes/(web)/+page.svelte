<script lang="ts">
	import {
		Rocket,
		Zap,
		Code2,
		Database,
		Brain,
		CreditCard,
		Smartphone,
		Layers,
		Check,
		ArrowRight,
		Cpu,
		Globe,
		Shield
	} from 'lucide-svelte';
</script>

<div
	class="h-full bg-base-100 overflow-x-hidden selection:bg-primary selection:text-primary-content"
>
	<!-- Hero Section -->
	<section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
		<!-- Dynamic Background -->
		<div class="absolute inset-0 z-0">
			<div class="absolute inset-0 bg-base-100"></div>
			<div
				class="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"
			></div>
			<div
				class="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slower"
			></div>
			<!-- Grid Pattern Overlay -->
			<div
				class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"
			></div>
		</div>

		<div class="container relative z-10 mx-auto px-6 pt-20 pb-32 text-center">
			<div
				class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-200/50 backdrop-blur-md border border-base-content/5 mb-8 animate-fade-in-up"
			>
				<Rocket class="w-4 h-4 text-primary" />
				<span class="text-sm font-medium text-base-content/80">Ship Faster Than Ever</span>
			</div>

			<h1
				class="max-w-5xl mx-auto text-5xl md:text-7xl font-black tracking-tight leading-tight mb-8 animate-fade-in-up delay-100"
			>
				Launch Your <span
					class="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-accent"
					>AI Product</span
				>
				<br />in Days, Not Months
			</h1>

			<p
				class="max-w-2xl mx-auto text-xl md:text-2xl text-base-content/70 leading-relaxed mb-12 animate-fade-in-up delay-200"
			>
				The ultimate production-ready template. SvelteKit, PocketBase, AI integration, Payments, and
				Authentication. Everything you need to build the next big thing.
			</p>

			<div
				class="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up delay-300"
			>
				<a
					href="#pricing"
					class="group relative px-8 py-4 bg-primary text-primary-content font-bold text-lg rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_var(--color-primary)]"
				>
					<div
						class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
					></div>
					<span class="relative flex items-center gap-2">
						Get the Template
						<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
					</span>
				</a>
				<a
					href="#stack"
					class="text-base-content/70 hover:text-base-content font-medium transition-colors"
				>
					View Tech Stack
				</a>
			</div>
		</div>
	</section>

	<!-- Tech Stack Section -->
	<section id="stack" class="py-20 bg-base-200/30">
		<div class="container mx-auto px-6">
			<div class="text-center mb-16">
				<h2 class="text-3xl md:text-4xl font-bold mb-4">Built with Modern Tech</h2>
				<p class="text-base-content/60">A robust, scalable foundation for your application.</p>
			</div>
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
				{#each [
					{ icon: Globe, name: 'SvelteKit', desc: 'Fullstack Framework' },
					{ icon: Database, name: 'PocketBase', desc: 'Realtime Backend' },
					{ icon: Brain, name: 'OpenAI', desc: 'AI Intelligence' },
					{ icon: CreditCard, name: 'Stripe', desc: 'Payments' },
					{ icon: Layers, name: 'DaisyUI', desc: 'UI Components' },
					{ icon: Cpu, name: 'Meilisearch', desc: 'Vector Search' }
				] as tech}
					<div
						class="flex flex-col items-center p-6 rounded-2xl bg-base-100 border border-base-content/5 hover:border-primary/20 transition-colors"
					>
						<div class="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center mb-4">
							<svelte:component this={tech.icon} class="w-6 h-6 text-primary" />
						</div>
						<h3 class="font-bold mb-1">{tech.name}</h3>
						<p class="text-xs text-base-content/50">{tech.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Features Grid -->
	<section class="py-32 relative">
		<div class="container mx-auto px-6">
			<div class="grid md:grid-cols-2 gap-12 items-center">
				<div>
					<h2 class="text-4xl md:text-5xl font-bold mb-6">Everything Included</h2>
					<p class="text-xl text-base-content/70 mb-8">
						Don't waste time setting up boilerplate. We've handled the hard parts so you can focus
						on your unique value proposition.
					</p>
					<div class="space-y-6">
						{#each [
							'Production-ready Authentication flow',
							'Stripe Subscription & One-time payments',
							'AI Chat interface with streaming',
							'Vector Memory & Semantic Search',
							'Domain-Driven Design Architecture',
							'Progressive Web App (PWA) setup'
						] as feature}
							<div class="flex items-center gap-4">
								<div class="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
									<Check class="w-3 h-3 text-success" />
								</div>
								<span class="font-medium">{feature}</span>
							</div>
						{/each}
					</div>
				</div>
				<div class="relative">
					<div
						class="absolute inset-0 bg-linear-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl"
					></div>
					<div class="relative bg-base-100 rounded-3xl border border-base-content/10 p-8 shadow-2xl">
						<div class="space-y-4">
							<div class="flex items-center gap-4 p-4 rounded-xl bg-base-200/50">
								<Code2 class="w-8 h-8 text-primary" />
								<div>
									<div class="font-bold">Clean Codebase</div>
									<div class="text-sm text-base-content/60">TypeScript & Modular Architecture</div>
								</div>
							</div>
							<div class="flex items-center gap-4 p-4 rounded-xl bg-base-200/50">
								<Shield class="w-8 h-8 text-secondary" />
								<div>
									<div class="font-bold">Secure by Default</div>
									<div class="text-sm text-base-content/60">RLS & Type-safe APIs</div>
								</div>
							</div>
							<div class="flex items-center gap-4 p-4 rounded-xl bg-base-200/50">
								<Smartphone class="w-8 h-8 text-accent" />
								<div>
									<div class="font-bold">Mobile First</div>
									<div class="text-sm text-base-content/60">Responsive & PWA Ready</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Pricing & Offer Section -->
	<section id="pricing" class="py-32 bg-base-200/50 relative overflow-hidden">
		<!-- Decorative Blur -->
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px]"
		></div>

		<div class="container relative z-10 mx-auto px-6">
			<div class="text-center mb-20">
				<h2 class="text-4xl md:text-6xl font-bold mb-6">Start Building Today</h2>
				<p class="text-xl text-base-content/70">Choose the path that fits your needs.</p>
			</div>

			<div class="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
				<!-- Template Access -->
				<div
					class="relative group p-1 rounded-3xl bg-linear-to-b from-primary/50 to-secondary/50 hover:from-primary hover:to-secondary transition-all duration-300"
				>
					<div class="h-full bg-base-100 rounded-[22px] p-8 md:p-12 flex flex-col relative overflow-hidden">
                        <div class="absolute top-0 right-0 bg-primary text-primary-content text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
						<div class="mb-8">
							<h3 class="text-2xl font-bold mb-2">Source Code Access</h3>
							<p class="text-base-content/60">Get full access to the repository and start coding.</p>
						</div>
						<div class="mb-8">
							<div class="flex items-baseline gap-2">
								<span class="text-5xl font-black">$99</span>
								<span class="text-2xl text-base-content/40 line-through">$200</span>
							</div>
							<p class="text-sm text-success font-medium mt-2">Limited time offer</p>
						</div>
						<ul class="space-y-4 mb-12 flex-1">
							{#each ['Full Source Code', 'MIT License', 'Lifetime Updates', 'Documentation', 'Discord Support'] as item}
								<li class="flex items-center gap-3">
									<Check class="w-5 h-5 text-primary" />
									<span>{item}</span>
								</li>
							{/each}
						</ul>
						<button
							class="btn btn-primary w-full text-lg h-14 rounded-xl shadow-[0_0_20px_-5px_var(--color-primary)]"
						>
							Buy Now
						</button>
					</div>
				</div>

				<!-- Custom Development -->
				<div
					class="relative group p-1 rounded-3xl bg-base-content/10 hover:bg-base-content/20 transition-all duration-300"
				>
					<div class="h-full bg-base-100 rounded-[22px] p-8 md:p-12 flex flex-col">
						<div class="mb-8">
							<h3 class="text-2xl font-bold mb-2">Custom Development</h3>
							<p class="text-base-content/60">Need a tailored solution? We build it for you.</p>
						</div>
						<div class="mb-8">
							<div class="flex items-baseline gap-2">
								<span class="text-5xl font-black">$999</span>
								<span class="text-2xl text-base-content/40 line-through">$2000</span>
							</div>
							<p class="text-sm text-base-content/40 mt-2">Based on your requirements</p>
						</div>
						<ul class="space-y-4 mb-12 flex-1">
							{#each ['Professional Development', 'UI/UX Design', 'Custom Features', 'Deployment Setup', 'Maintenance Support'] as item}
								<li class="flex items-center gap-3">
									<Zap class="w-5 h-5 text-secondary" />
									<span>{item}</span>
								</li>
							{/each}
						</ul>
						<a
							href="https://cogitosoftware.nl/mvp-offer"
							target="_blank"
							class="btn btn-outline w-full text-lg h-14 rounded-xl hover:bg-base-content hover:text-base-100"
						>
							Contact Us
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="py-12 border-t border-base-content/10">
		<div class="container mx-auto px-6 text-center">
			<p class="text-base-content/50">
				&copy; {new Date().getFullYear()} Cogito Software. All rights reserved.
			</p>
		</div>
	</footer>
</div>

<style>
	.animate-pulse-slow {
		animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.animate-pulse-slower {
		animation: pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.animate-fade-in-up {
		animation: fadeInUp 0.8s ease-out forwards;
		opacity: 0;
		transform: translateY(20px);
	}

	.delay-100 {
		animation-delay: 100ms;
	}
	.delay-200 {
		animation-delay: 200ms;
	}
	.delay-300 {
		animation-delay: 300ms;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
