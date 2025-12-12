<script lang="ts">
	import {
		BookOpen,
		Brain,
		Clock,
		Target,
		MessageSquare,
		CheckCircle2,
		Sparkles,
		ArrowRight,
		GraduationCap,
		Mic,
		PenLine,
		HeadphonesIcon,
		BookOpenCheck,
		Zap,
		TrendingUp,
		Award,
		AlertCircle,
		Send
	} from 'lucide-svelte';

	import { Collections, pb } from '$lib';
	import ThemeController from '$lib/shared/ui/ThemeController.svelte';

	let heroFormSubmitted = $state(false);
	let bottomFormSubmitted = $state(false);
	let heroIsSubmitting = $state(false);
	let bottomIsSubmitting = $state(false);

	async function submitLeadForm(e: Event) {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const contact = formData.get('contact') as string;
		const form = e.target as HTMLFormElement;

		// Set loading state for the specific form
		if (form.id === 'hero-form') {
			heroIsSubmitting = true;
		} else if (form.id === 'bottom-form') {
			bottomIsSubmitting = true;
		}

		try {
			await pb.collection(Collections.Leads).create({ contact, payload: { source: 'de-exam' } });
			// Determine which form was submitted based on the form element
			if (form.id === 'hero-form') {
				heroFormSubmitted = true;
			} else if (form.id === 'bottom-form') {
				bottomFormSubmitted = true;
			}
		} catch (error) {
			console.error(error);
		} finally {
			if (form.id === 'hero-form') {
				heroIsSubmitting = false;
			} else if (form.id === 'bottom-form') {
				bottomIsSubmitting = false;
			}
		}
	}

	const painPoints = [
		{
			icon: AlertCircle,
			emoji: '😰',
			title: 'Exam Anxiety',
			description: 'Fear of the unknown format and unexpected questions that freeze your mind'
		},
		{
			icon: Clock,
			emoji: '⏰',
			title: 'Time Pressure',
			description: 'Struggling to complete all sections within strict time limits'
		},
		{
			icon: MessageSquare,
			emoji: '🗣️',
			title: 'Speaking Stress',
			description: 'No partner to practice with, no feedback on pronunciation or fluency'
		},
		{
			icon: PenLine,
			emoji: '✍️',
			title: 'Writing Uncertainty',
			description: 'Not knowing if your essays meet the official criteria and standards'
		}
	];

	const features = [
		{
			icon: Brain,
			title: 'AI Exam Simulator',
			description:
				'Practice with realistic exam questions generated to match actual Goethe-Zertifikat format and difficulty'
		},
		{
			icon: MessageSquare,
			title: 'Instant AI Feedback',
			description:
				'Get detailed explanations for every answer, understand your mistakes, and learn the right approach'
		},
		{
			icon: Mic,
			title: 'Speaking Practice',
			description:
				'Practice speaking tasks with AI that evaluates pronunciation, fluency, and content accuracy'
		},
		{
			icon: PenLine,
			title: 'Writing Analysis',
			description:
				'Submit essays and receive comprehensive feedback on grammar, structure, and exam criteria'
		},
		{
			icon: Target,
			title: 'Weak Point Detection',
			description:
				'AI identifies your problem areas and creates personalized exercises to strengthen them'
		},
		{
			icon: TrendingUp,
			title: 'Progress Tracking',
			description:
				'Monitor your improvement with detailed analytics and readiness score for the real exam'
		}
	];

	const examLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

	const stats = [
		{ value: '4', label: 'Exam sections covered', suffix: '' },
		{ value: '1000', label: 'Practice questions', suffix: '+' },
		{ value: '24/7', label: 'AI availability', suffix: '' },
		{ value: '85', label: 'Pass rate improvement', suffix: '%' }
	];
</script>

<svelte:head>
	<title>Goethe-Zertifikat AI Exam Trainer | Master German Certification</title>
	<meta
		name="description"
		content="Prepare for Goethe-Zertifikat with AI-powered exam simulator. Practice reading, writing, listening, and speaking with instant feedback."
	/>
</svelte:head>

<div
	class="min-h-screen bg-base-100 overflow-x-hidden selection:bg-primary selection:text-primary-content"
>
	<!-- Hero Section -->
	<section class="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
		<!-- Theme Controller - Fixed in top right -->
		<div class="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
			<ThemeController />
		</div>

		<!-- Dynamic Background -->
		<div class="absolute inset-0 z-0">
			<div class="absolute inset-0 bg-base-100"></div>
			<!-- German flag inspired gradient orbs -->
			<div
				class="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-warning/15 rounded-full blur-[100px] animate-pulse-slow"
			></div>
			<div
				class="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-error/10 rounded-full blur-[80px] animate-pulse-slower"
			></div>
			<div
				class="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[60px] animate-pulse-slow"
			></div>
			<!-- Grid Pattern -->
			<div
				class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0icmdiYSgxMjgsMTI4LDEyOCwwLjA4KSIvPjwvc3ZnPg==')] opacity-60"
			></div>
		</div>

		<div class="container relative z-10 mx-auto px-6 pt-24 pb-16">
			<div class="max-w-6xl mx-auto">
				<div class="grid lg:grid-cols-2 gap-12 items-center">
					<!-- Left Column: Content -->
					<div class="text-center lg:text-left">
						<!-- Badge -->
						<div
							class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 mb-8 animate-fade-in-up"
						>
							<GraduationCap class="w-4 h-4 text-warning" />
							<span class="text-sm font-medium text-base-content/80">AI-Powered Exam Prep</span>
						</div>

						<!-- Main Headline -->
						<h1
							class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 animate-fade-in-up delay-100"
						>
							<span class="block">Pass Your</span>
							<span
								class="text-transparent bg-clip-text bg-linear-to-r from-warning via-error to-warning"
								>Goethe-Zertifikat</span
							>
							<span class="block mt-2">With Confidence</span>
						</h1>

						<!-- Subheadline -->
						<p
							class="text-lg md:text-xl text-base-content/60 leading-relaxed mb-8 animate-fade-in-up delay-200"
						>
							Practice with a realistic AI exam simulator that gives instant feedback on reading,
							writing, listening, and speaking — anytime, anywhere.
						</p>

						<!-- Exam Levels -->
						<div
							class="flex flex-wrap gap-2 justify-center lg:justify-start mb-8 animate-fade-in-up delay-250"
						>
							{#each examLevels as level (level)}
								<span
									class="px-3 py-1 text-sm font-bold rounded-sm bg-base-200 border border-base-content/10 text-base-content/70"
								>
									{level}
								</span>
							{/each}
						</div>

						<!-- Quick Stats Mobile -->
						<div class="grid grid-cols-2 gap-4 mb-8 lg:hidden animate-fade-in-up delay-300">
							{#each stats.slice(0, 2) as stat (stat.label)}
								<div class="text-center p-4 bg-base-200/50 rounded-sm">
									<div class="text-2xl font-black text-primary">
										{stat.value}{stat.suffix}
									</div>
									<div class="text-xs text-base-content/50">{stat.label}</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Right Column: Form -->
					<div class="animate-fade-in-up delay-300">
						<div
							class="relative p-8 bg-base-100 rounded-sm border border-base-content/10 shadow-2xl shadow-primary/5"
						>
							<!-- Decorative elements -->
							<div
								class="absolute -top-3 -right-3 w-20 h-20 bg-warning/10 rounded-full blur-2xl"
							></div>
							<div
								class="absolute -bottom-3 -left-3 w-16 h-16 bg-primary/10 rounded-full blur-xl"
							></div>

							<div class="relative">
								<div class="flex items-center gap-3 mb-6">
									<div class="w-12 h-12 rounded-sm bg-warning/10 flex items-center justify-center">
										<Sparkles class="w-6 h-6 text-warning" />
									</div>
									<div>
										<h3 class="font-bold text-lg">Get Early Access</h3>
										<p class="text-sm text-base-content/60">Be first to try the AI trainer</p>
									</div>
								</div>

								<!-- Lead Form -->
								{#if !heroFormSubmitted}
									<form id="hero-form" onsubmit={submitLeadForm} class="space-y-4">
										<div>
											<label for="hero-contact" class="block text-sm font-medium mb-2"
												>Email or Phone</label
											>
											<input
												type="text"
												id="hero-contact"
												name="contact"
												placeholder="your@email.com or +49..."
												required
												class="input input-bordered w-full bg-base-200/50 focus:border-warning focus:ring-warning"
											/>
										</div>
										<button
											type="submit"
											disabled={heroIsSubmitting}
											class="btn btn-warning w-full gap-2 text-warning-content font-bold"
										>
											{#if heroIsSubmitting}
												<span class="loading loading-spinner loading-sm"></span>
												Submitting...
											{:else}
												<Send class="w-4 h-4" />
												Join Waitlist
											{/if}
										</button>
										<p class="text-xs text-center text-base-content/50">
											Free early access • No spam • Unsubscribe anytime
										</p>
									</form>
								{:else}
									<!-- Success Message -->
									<div class="text-center py-8">
										<div
											class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
										>
											<CheckCircle2 class="w-8 h-8 text-success" />
										</div>
										<h3 class="text-xl font-bold mb-2">You're on the list!</h3>
										<p class="text-base-content/60">
											We'll notify you when the AI trainer is ready.
										</p>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Stats Bar Desktop -->
				<div
					class="hidden lg:flex items-center justify-center gap-8 md:gap-16 mt-16 animate-fade-in-up delay-400"
				>
					{#each stats as stat (stat.label)}
						<div class="text-center">
							<div class="text-3xl md:text-4xl font-black text-primary">
								{stat.value}{stat.suffix}
							</div>
							<div class="text-sm text-base-content/50 mt-1">{stat.label}</div>
						</div>
						{#if stat !== stats[stats.length - 1]}
							<div class="w-px h-12 bg-base-content/10"></div>
						{/if}
					{/each}
				</div>
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
					<div
						class="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-error/10 text-error text-sm font-medium mb-4"
					>
						<AlertCircle class="w-4 h-4" />
						COMMON STRUGGLES
					</div>
					<h2 class="text-3xl md:text-4xl font-bold mb-4">Why Students Fail the Goethe Exam</h2>
					<p class="text-base-content/60 text-lg">Does this sound familiar?</p>
				</div>

				<div class="grid sm:grid-cols-2 gap-6">
					{#each painPoints as pain, i (pain.title)}
						<div
							class="group p-6 bg-base-100 border border-base-content/5 rounded-sm hover:border-error/30 transition-all duration-300"
							style="animation-delay: {i * 100}ms"
						>
							<div class="flex items-start gap-4">
								<div
									class="w-12 h-12 rounded-sm bg-error/10 flex items-center justify-center shrink-0 group-hover:bg-error/20 transition-colors"
								>
									<span class="text-2xl">{pain.emoji}</span>
								</div>
								<div>
									<h3 class="font-bold mb-1">{pain.title}</h3>
									<p class="text-base-content/60 text-sm">{pain.description}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-12 text-center">
					<p class="text-xl font-bold">
						<span class="text-error">Traditional prep isn't enough.</span>
						<span class="text-primary">You need practice that adapts to YOU.</span>
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-32 relative">
		<div class="container mx-auto px-6">
			<div class="text-center mb-20">
				<div
					class="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 text-primary text-sm font-medium mb-4"
				>
					<Zap class="w-4 h-4" />
					POWERFUL FEATURES
				</div>
				<h2 class="text-3xl md:text-5xl font-bold mb-4">Your Personal AI Exam Coach</h2>
				<p class="text-base-content/60 text-lg max-w-2xl mx-auto">
					Everything you need to prepare for all four exam sections
				</p>
			</div>

			<!-- Exam Sections Visual -->
			<div class="max-w-4xl mx-auto mb-16">
				<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div
						class="p-6 bg-base-100 border border-primary/20 rounded-sm text-center hover:border-primary/50 transition-colors"
					>
						<BookOpen class="w-8 h-8 text-primary mx-auto mb-3" />
						<h4 class="font-bold">Lesen</h4>
						<p class="text-xs text-base-content/50 mt-1">Reading</p>
					</div>
					<div
						class="p-6 bg-base-100 border border-secondary/20 rounded-sm text-center hover:border-secondary/50 transition-colors"
					>
						<HeadphonesIcon class="w-8 h-8 text-secondary mx-auto mb-3" />
						<h4 class="font-bold">Hören</h4>
						<p class="text-xs text-base-content/50 mt-1">Listening</p>
					</div>
					<div
						class="p-6 bg-base-100 border border-accent/20 rounded-sm text-center hover:border-accent/50 transition-colors"
					>
						<PenLine class="w-8 h-8 text-accent mx-auto mb-3" />
						<h4 class="font-bold">Schreiben</h4>
						<p class="text-xs text-base-content/50 mt-1">Writing</p>
					</div>
					<div
						class="p-6 bg-base-100 border border-warning/20 rounded-sm text-center hover:border-warning/50 transition-colors"
					>
						<Mic class="w-8 h-8 text-warning mx-auto mb-3" />
						<h4 class="font-bold">Sprechen</h4>
						<p class="text-xs text-base-content/50 mt-1">Speaking</p>
					</div>
				</div>
			</div>

			<div class="max-w-6xl mx-auto">
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each features as feature (feature.title)}
						<div
							class="group relative p-8 bg-base-100 border border-base-content/10 rounded-sm hover:border-primary/30 transition-all duration-300"
						>
							<div
								class="w-14 h-14 rounded-sm bg-base-200 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors"
							>
								<feature.icon class="w-7 h-7 text-primary" />
							</div>

							<h3 class="text-xl font-bold mb-3">{feature.title}</h3>
							<p class="text-base-content/60 leading-relaxed">{feature.description}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="py-32 bg-base-200/50 relative overflow-hidden">
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-warning/5 rounded-full blur-[150px]"
		></div>

		<div class="container relative z-10 mx-auto px-6">
			<div class="max-w-5xl mx-auto">
				<div class="text-center mb-16">
					<div
						class="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-secondary/10 text-secondary text-sm font-medium mb-4"
					>
						<BookOpenCheck class="w-4 h-4" />
						HOW IT WORKS
					</div>
					<h2 class="text-3xl md:text-5xl font-bold mb-4">Train Like the Real Exam</h2>
					<p class="text-base-content/60 text-lg">
						Practice under realistic conditions with intelligent feedback
					</p>
				</div>

				<div class="grid md:grid-cols-3 gap-8">
					<div class="text-center">
						<div
							class="w-16 h-16 rounded-full bg-warning text-warning-content font-black text-2xl flex items-center justify-center mx-auto mb-6"
						>
							1
						</div>
						<h3 class="text-xl font-bold mb-3">Choose Your Level</h3>
						<p class="text-base-content/60">
							Select from A1 to C2 and pick which exam section you want to practice
						</p>
					</div>
					<div class="text-center">
						<div
							class="w-16 h-16 rounded-full bg-primary text-primary-content font-black text-2xl flex items-center justify-center mx-auto mb-6"
						>
							2
						</div>
						<h3 class="text-xl font-bold mb-3">Practice with AI</h3>
						<p class="text-base-content/60">
							Complete realistic tasks while AI evaluates your answers in real-time
						</p>
					</div>
					<div class="text-center">
						<div
							class="w-16 h-16 rounded-full bg-success text-success-content font-black text-2xl flex items-center justify-center mx-auto mb-6"
						>
							3
						</div>
						<h3 class="text-xl font-bold mb-3">Review & Improve</h3>
						<p class="text-base-content/60">
							Get detailed feedback, understand mistakes, and track your progress
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Testimonial/Social Proof -->
	<section class="py-24 relative">
		<div class="container mx-auto px-6">
			<div class="max-w-4xl mx-auto">
				<div
					class="p-8 md:p-12 bg-base-100 border border-base-content/10 rounded-sm relative overflow-hidden"
				>
					<div class="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-3xl"></div>
					<div class="relative">
						<div class="flex items-center gap-1 mb-6">
							{#each Array(5) as _, i (i)}
								<svg
									class="w-6 h-6 text-warning fill-warning"
									viewBox="0 0 20 20"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
							{/each}
						</div>
						<blockquote class="text-xl md:text-2xl font-medium mb-6 leading-relaxed">
							"Traditional textbooks couldn't prepare me for the speaking section. An AI practice
							partner that gives instant feedback would have been a game-changer."
						</blockquote>
						<div class="flex items-center gap-4">
							<div
								class="w-12 h-12 rounded-full bg-base-200 flex items-center justify-center font-bold text-primary"
							>
								MK
							</div>
							<div>
								<div class="font-bold">Maria K.</div>
								<div class="text-sm text-base-content/50">Passed B2 Certificate</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA Section -->
	<section class="py-32 relative overflow-hidden">
		<div class="absolute inset-0 z-0">
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-warning/10 rounded-full blur-[150px]"
			></div>
		</div>

		<div class="container relative z-10 mx-auto px-6">
			<div class="max-w-3xl mx-auto">
				<div class="text-center mb-12">
					<div
						class="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-success/10 text-success text-sm font-bold mb-8"
					>
						<Award class="w-4 h-4" />
						BE FIRST IN LINE
					</div>

					<h2 class="text-4xl md:text-6xl font-bold mb-6">
						Ready to Ace Your<br />
						<span class="text-transparent bg-clip-text bg-linear-to-r from-warning to-error"
							>Goethe-Zertifikat?</span
						>
					</h2>

					<p class="text-xl text-base-content/60 mb-10 max-w-xl mx-auto">
						Join the waitlist and be the first to access the AI-powered exam trainer.
					</p>
				</div>

				<!-- Bottom Form -->
				<div class="max-w-md mx-auto">
					<div class="p-8 bg-base-100 border border-base-content/10 rounded-sm shadow-xl">
						{#if !bottomFormSubmitted}
							<form id="bottom-form" onsubmit={submitLeadForm} class="space-y-4">
								<div>
									<label for="cta-contact" class="block text-sm font-medium mb-2"
										>Email or Phone</label
									>
									<input
										type="text"
										id="cta-contact"
										name="contact"
										placeholder="your@email.com or +49..."
										required
										class="input input-bordered w-full bg-base-200/50 focus:border-warning"
									/>
								</div>
								<button
									type="submit"
									disabled={bottomIsSubmitting}
									class="btn btn-warning w-full gap-2 text-warning-content font-bold text-lg"
								>
									{#if bottomIsSubmitting}
										<span class="loading loading-spinner loading-sm"></span>
										Submitting...
									{:else}
										<ArrowRight class="w-5 h-5" />
										Get Early Access
									{/if}
								</button>
							</form>
						{:else}
							<!-- Success Message -->
							<div class="text-center py-6">
								<div
									class="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4"
								>
									<CheckCircle2 class="w-7 h-7 text-success" />
								</div>
								<h3 class="text-lg font-bold mb-1">Awesome!</h3>
								<p class="text-base-content/60 text-sm">
									You're on the list. We'll reach out soon!
								</p>
							</div>
						{/if}
					</div>

					<p class="mt-6 text-sm text-center text-base-content/40">
						🔒 We respect your privacy • No spam ever
					</p>
				</div>
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
	.delay-250 {
		animation-delay: 250ms;
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
