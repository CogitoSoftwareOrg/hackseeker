<script lang="ts">
	import {
		Sparkles,
		Search,
		FileText,
		Globe2,
		ArrowRight,
		Check,
		Zap,
		Target,
		TrendingUp,
		MessageSquare,
		Lightbulb,
		Clock,
		BadgeCheck,
		Rocket,
		Brain,
		ChevronRight,
		Play
	} from 'lucide-svelte';

	const steps = [
		{
			icon: MessageSquare,
			title: 'Describe Your Idea',
			description:
				'Chat with HackSeeker about your product concept. Our AI transforms vague thoughts into structured pain hypotheses.'
		},
		{
			icon: Search,
			title: 'Automated Validation',
			description:
				'We scan Google, Reddit, ProductHunt, and forums to find real market signals, competitors, and demand proof.'
		},
		{
			icon: FileText,
			title: 'Actionable Report',
			description:
				'Get a structured PDF with opportunity scores, competitor landscape, and implementation recommendations.'
		},
		{
			icon: Globe2,
			title: 'ZeroLanding Generator',
			description:
				'Instantly create a landing page with waitlist form to validate demand and collect early adopters.'
		}
	];

	const painPoints = [
		{ text: 'Manually opening 20+ tabs for each idea', icon: '😫' },
		{ text: 'Unstructured notes scattered everywhere', icon: '📝' },
		{ text: 'Days spent on validation that leads nowhere', icon: '⏰' },
		{ text: '"Maybe there is something here?" uncertainty', icon: '🤔' }
	];

	const benefits = [
		{
			icon: Clock,
			title: 'Minutes, Not Days',
			description: 'Validate multiple ideas in a single evening'
		},
		{
			icon: Target,
			title: 'Data-Driven Decisions',
			description: 'Real market signals, not gut feelings'
		},
		{
			icon: TrendingUp,
			title: 'Opportunity Scoring',
			description: 'Clear metrics: demand, competition, pain intensity'
		},
		{
			icon: Rocket,
			title: 'Launch Faster',
			description: 'From idea to landing page in one session'
		}
	];

	const audiences = [
		{
			title: 'Indie Hackers',
			description: 'Constantly generating new product ideas and need quick validation loops'
		},
		{
			title: 'Early-Stage Founders',
			description: 'Exploring multiple hypotheses before committing resources'
		},
		{
			title: 'Product Managers',
			description: 'Need fast, cheap validation for new feature ideas'
		}
	];
</script>

<div
	class="h-full bg-base-100 overflow-x-hidden selection:bg-primary selection:text-primary-content"
>
	<!-- Hero Section -->
	<section class="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
		<!-- Dynamic Background -->
		<div class="absolute inset-0 z-0">
			<div class="absolute inset-0 bg-base-100"></div>
			<!-- Animated gradient orbs -->
			<div
				class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px] animate-pulse-slow"
			></div>
			<div
				class="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[80px] animate-pulse-slower"
			></div>
			<div
				class="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-accent/10 rounded-full blur-[60px] animate-pulse-slow"
			></div>
			<!-- Grid Pattern -->
			<div
				class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgxMjgsMTI4LDEyOCwwLjA4KSIvPjwvc3ZnPg==')] opacity-60"
			></div>
			<!-- Scan lines effect -->
			<div
				class="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] pointer-events-none"
			></div>
		</div>

		<div class="container relative z-10 mx-auto px-6 pt-24 pb-32">
			<div class="max-w-5xl mx-auto text-center">
				<!-- Badge -->
				<div
					class="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-base-200/70 backdrop-blur-md border border-primary/20 mb-10 animate-fade-in-up"
				>
					<Sparkles class="w-4 h-4 text-primary" />
					<span class="text-sm font-medium text-base-content/80 tracking-wide uppercase"
						>AI-Powered Idea Validation</span
					>
				</div>

				<!-- Main Headline -->
				<h1
					class="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8 animate-fade-in-up delay-100"
				>
					<span class="block">Find & Validate Your</span>
					<span
						class="text-transparent bg-clip-text bg-linear-to-r from-primary via-secondary to-primary"
						>Product Idea</span
					>
					<span class="block mt-2">in Minutes</span>
				</h1>

				<!-- Subheadline -->
				<p
					class="max-w-2xl mx-auto text-lg md:text-xl text-base-content/60 leading-relaxed mb-12 animate-fade-in-up delay-200"
				>
					Stop wasting weeks on manual research. HackSeeker turns your vague ideas into validated
					opportunities with real market signals from Google, Reddit, and ProductHunt.
				</p>

				<!-- CTA Buttons -->
				<div
					class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300"
				>
					<a
						href="/app/auth/sign-up"
						class="group relative px-8 py-4 bg-primary text-primary-content font-bold text-lg rounded-sm overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_var(--color-primary)]"
					>
						<div
							class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
						></div>
						<span class="relative flex items-center gap-2">
							Start Validating Free
							<ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
						</span>
					</a>
					<a
						href="#how-it-works"
						class="group flex items-center gap-2 px-6 py-4 text-base-content/70 hover:text-primary font-medium transition-colors"
					>
						<div
							class="w-10 h-10 rounded-full border border-base-content/20 flex items-center justify-center group-hover:border-primary/50 transition-colors"
						>
							<Play class="w-4 h-4 ml-0.5" />
						</div>
						See How It Works
					</a>
				</div>

				<!-- Quick Stats -->
				<div
					class="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12 animate-fade-in-up delay-400"
				>
					<div class="text-center">
						<div class="text-3xl md:text-4xl font-black text-primary">5 min</div>
						<div class="text-sm text-base-content/50 mt-1">avg. validation time</div>
					</div>
					<div class="w-px h-12 bg-base-content/10 hidden md:block"></div>
					<div class="text-center">
						<div class="text-3xl md:text-4xl font-black text-secondary">100+</div>
						<div class="text-sm text-base-content/50 mt-1">sources analyzed</div>
					</div>
					<div class="w-px h-12 bg-base-content/10 hidden md:block"></div>
					<div class="text-center">
						<div class="text-3xl md:text-4xl font-black text-accent">Real</div>
						<div class="text-sm text-base-content/50 mt-1">market signals</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Scroll indicator -->
		<div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
			<div
				class="w-6 h-10 rounded-full border-2 border-base-content/20 flex items-start justify-center p-2"
			>
				<div class="w-1 h-2 bg-primary rounded-full animate-scroll"></div>
			</div>
		</div>
	</section>

	<!-- Pain Points Section -->
	<section class="py-24 bg-base-200/30 relative overflow-hidden">
		<div
			class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-base-content/10 to-transparent"
		></div>
		<div class="container mx-auto px-6">
			<div class="max-w-4xl mx-auto">
				<div class="text-center mb-16">
					<h2 class="text-3xl md:text-4xl font-bold mb-4">The Old Way Is Broken</h2>
					<p class="text-base-content/60 text-lg">Sound familiar? You're not alone.</p>
				</div>

				<div class="grid sm:grid-cols-2 gap-4">
					{#each painPoints as pain, i}
						<div
							class="group p-6 bg-base-100 border border-base-content/5 rounded-sm hover:border-error/30 transition-all duration-300"
							style="animation-delay: {i * 100}ms"
						>
							<div class="flex items-start gap-4">
								<span class="text-2xl">{pain.icon}</span>
								<p class="text-base-content/80 font-medium">{pain.text}</p>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-12 text-center">
					<p class="text-xl font-bold text-primary">
						There has to be a better way. <span class="text-base-content">There is.</span>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section id="how-it-works" class="py-32 relative">
		<div class="container mx-auto px-6">
			<div class="text-center mb-20">
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-secondary/10 text-secondary text-sm font-medium mb-4"
				>
					<Zap class="w-4 h-4" />
					HOW IT WORKS
				</div>
				<h2 class="text-3xl md:text-5xl font-bold mb-4">From Idea to Validation</h2>
				<p class="text-base-content/60 text-lg max-w-2xl mx-auto">
					A simple, chat-driven process that replaces hours of manual research
				</p>
			</div>

			<div class="max-w-5xl mx-auto">
				<div class="grid md:grid-cols-2 gap-6">
					{#each steps as step, i}
						<div
							class="group relative p-8 bg-base-100 border border-base-content/10 rounded-sm hover:border-primary/30 transition-all duration-300"
						>
							<!-- Step Number -->
							<div
								class="absolute -top-4 -left-4 w-8 h-8 bg-primary text-primary-content font-bold text-sm flex items-center justify-center rounded-sm"
							>
								{i + 1}
							</div>

							<div
								class="w-14 h-14 rounded-sm bg-base-200 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors"
							>
								<svelte:component this={step.icon} class="w-7 h-7 text-primary" />
							</div>

							<h3 class="text-xl font-bold mb-3">{step.title}</h3>
							<p class="text-base-content/60 leading-relaxed">{step.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section class="py-32 bg-base-200/50 relative overflow-hidden">
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"
		></div>

		<div class="container relative z-10 mx-auto px-6">
			<div class="max-w-6xl mx-auto">
				<div class="grid lg:grid-cols-2 gap-16 items-center">
					<div>
						<div
							class="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 text-primary text-sm font-medium mb-6"
						>
							<Brain class="w-4 h-4" />
							WHY HACKSEEKER
						</div>
						<h2 class="text-3xl md:text-5xl font-bold mb-6">
							Stop Guessing.<br />
							<span class="text-primary">Start Knowing.</span>
						</h2>
						<p class="text-lg text-base-content/60 mb-8">
							HackSeeker gives you the same market intelligence that would take days of manual
							research — in a 5-minute chat session.
						</p>

						<a
							href="/app/auth/sign-up"
							class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-content font-bold rounded-sm hover:shadow-[0_0_30px_-10px_var(--color-primary)] transition-all"
						>
							Try It Free
							<ChevronRight class="w-5 h-5" />
						</a>
					</div>

					<div class="grid sm:grid-cols-2 gap-4">
						{#each benefits as benefit, i}
							<div
								class="p-6 bg-base-100 border border-base-content/5 rounded-sm hover:border-primary/20 transition-colors"
							>
								<div class="w-12 h-12 rounded-sm bg-base-200 flex items-center justify-center mb-4">
									<svelte:component this={benefit.icon} class="w-6 h-6 text-primary" />
								</div>
								<h3 class="font-bold mb-2">{benefit.title}</h3>
								<p class="text-sm text-base-content/60">{benefit.description}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- What You Get Section -->
	<section class="py-32 relative">
		<div class="container mx-auto px-6">
			<div class="max-w-4xl mx-auto">
				<div class="text-center mb-16">
					<h2 class="text-3xl md:text-5xl font-bold mb-4">What You Get</h2>
					<p class="text-base-content/60 text-lg">
						Every validation produces a structured, actionable output
					</p>
				</div>

				<div class="space-y-4">
					{#each [{ title: 'Structured Pain Hypothesis', description: 'Your vague idea transformed into a clear, testable problem statement' }, { title: 'Target Segments & JTBD', description: 'Who has this problem and what job are they trying to accomplish' }, { title: 'Competitor Landscape', description: 'Existing solutions, DIY hacks, and market gaps' }, { title: 'Pain Signals from Communities', description: 'Real quotes and complaints from Reddit, forums, and social media' }, { title: 'Opportunity Score', description: 'Data-driven assessment: demand, competition, pain intensity' }, { title: 'Actionable Recommendations', description: 'What to build, what to avoid, and how to differentiate' }] as item}
						<div
							class="group flex items-start gap-4 p-6 bg-base-100 border border-base-content/5 rounded-sm hover:border-primary/20 transition-colors"
						>
							<div
								class="w-8 h-8 rounded-sm bg-success/10 flex items-center justify-center shrink-0 mt-0.5"
							>
								<Check class="w-4 h-4 text-success" />
							</div>
							<div class="flex-1">
								<div class="flex items-center gap-3">
									<h3 class="font-bold">{item.title}</h3>
								</div>
								<p class="text-base-content/60 mt-1">{item.description}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Target Audience Section -->
	<section class="py-24 bg-base-200/30">
		<div class="container mx-auto px-6">
			<div class="max-w-4xl mx-auto">
				<div class="text-center mb-16">
					<h2 class="text-3xl md:text-4xl font-bold mb-4">Built For Builders</h2>
					<p class="text-base-content/60 text-lg">HackSeeker is your validation copilot</p>
				</div>

				<div class="grid md:grid-cols-3 gap-6">
					{#each audiences as audience}
						<div
							class="p-8 bg-base-100 border border-base-content/5 rounded-sm text-center hover:border-primary/20 transition-colors"
						>
							<h3 class="text-xl font-bold mb-3">{audience.title}</h3>
							<p class="text-base-content/60">{audience.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA Section -->
	<section class="py-32 relative overflow-hidden">
		<div class="absolute inset-0 z-0">
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px]"
			></div>
		</div>

		<div class="container relative z-10 mx-auto px-6">
			<div class="max-w-3xl mx-auto text-center">
				<div
					class="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-success/10 text-success text-sm font-bold mb-8"
				>
					<BadgeCheck class="w-4 h-4" />
					FREE TO START
				</div>

				<h2 class="text-4xl md:text-6xl font-bold mb-6">
					Ready to Validate<br />
					<span class="text-primary">Your Next Big Idea?</span>
				</h2>

				<p class="text-xl text-base-content/60 mb-10 max-w-xl mx-auto">
					Stop building products nobody wants. Start with validation.
				</p>

				<a
					href="/app/auth/sign-up"
					class="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-primary-content font-bold text-xl rounded-sm hover:scale-[1.02] hover:shadow-[0_0_50px_-10px_var(--color-primary)] transition-all"
				>
					Start Free Validation
					<ArrowRight class="w-6 h-6 group-hover:translate-x-1 transition-transform" />
				</a>

				<p class="mt-6 text-sm text-base-content/40">
					No credit card required • Free tier available
				</p>
			</div>
		</div>
	</section>
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
	.delay-400 {
		animation-delay: 400ms;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes scroll {
		0%,
		100% {
			transform: translateY(0);
			opacity: 1;
		}
		50% {
			transform: translateY(4px);
			opacity: 0.5;
		}
	}

	.animate-scroll {
		animation: scroll 1.5s ease-in-out infinite;
	}
</style>
