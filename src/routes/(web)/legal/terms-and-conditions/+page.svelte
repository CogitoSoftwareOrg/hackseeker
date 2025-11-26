<script lang="ts">
	import { FileText, AlertCircle, CheckCircle, Scale, Shield } from 'lucide-svelte';
</script>

<div class="bg-base-100">
	<section class="bg-base-200/50 py-20">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<div class="mb-6 inline-flex items-center justify-center rounded-sm bg-primary/10 p-4">
					<FileText class="h-10 w-10 text-primary" />
				</div>
				<h1 class="mb-4 text-4xl font-bold text-base-content sm:text-5xl">Terms and Conditions</h1>
				<p class="text-xl text-base-content/60">Last updated: November 2025</p>
			</div>
		</div>
	</section>

	<section class="py-20">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div
				class="mx-auto prose prose-lg max-w-4xl prose-headings:text-base-content prose-p:text-base-content/80 prose-strong:text-base-content"
			>
				<div class="mb-8 rounded-sm bg-base-200/50 p-6 border border-base-content/5">
					<div class="mb-4 flex items-center gap-3">
						<Scale class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Agreement to Terms</h2>
					</div>
					<p class="m-0 text-lg">
						By accessing and using HackSeeker, you agree to be bound by these Terms and Conditions.
						If you do not agree with any part of these terms, you may not use our service.
					</p>
				</div>

				<h2>Description of Service</h2>
				<p>
					HackSeeker is an AI-powered idea validation platform that helps entrepreneurs, indie
					hackers, and product teams validate product ideas through automated market research. The
					service includes chat-based idea exploration, automated web research, market analysis, and
					landing page generation features.
				</p>

				<h2>Acceptable Use</h2>
				<p>You agree to use HackSeeker only for lawful purposes and in accordance with these Terms.</p>
				<p>You agree not to:</p>
				<ul>
					<li>Use the service to validate ideas for illegal products or services</li>
					<li>Impersonate any person or entity</li>
					<li>Attempt to gain unauthorized access to our systems</li>
					<li>Interfere with or disrupt the service or servers</li>
					<li>Use automated systems to access the service without permission</li>
					<li>Scrape or collect data from the service in any automated manner</li>
					<li>Share your account credentials with third parties</li>
				</ul>

				<div class="my-8 rounded-sm bg-base-200/50 p-6 border border-base-content/5">
					<div class="mb-4 flex items-center gap-3">
						<CheckCircle class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">User Content & Intellectual Property</h2>
					</div>
					<p class="m-0 text-lg">
						You retain all rights to the ideas and content you submit to HackSeeker. The validation
						reports, analysis, and insights generated for you are yours to use. We do not claim
						ownership of your ideas or the outputs generated specifically for your account.
					</p>
				</div>

				<h2>AI-Generated Content Disclaimer</h2>
				<p>
					HackSeeker uses artificial intelligence to analyze market data and generate insights. While
					we strive for accuracy, AI-generated content may contain errors or inaccuracies. The
					validation results and recommendations should be used as one input among many in your
					decision-making process. We do not guarantee the success of any product idea or business
					venture.
				</p>

				<h2>Account Responsibility</h2>
				<p>
					You are responsible for maintaining the confidentiality of your account credentials and for
					all activities that occur under your account. You agree to notify us immediately of any
					unauthorized use of your account.
				</p>

				<h2>Subscription & Payments</h2>
				<p>
					HackSeeker offers free and paid subscription tiers. Paid subscriptions are billed according
					to the plan selected. You may cancel your subscription at any time. Refunds are provided in
					accordance with our refund policy.
				</p>

				<h2>Service Availability</h2>
				<p>
					We strive to provide continuous access to our service, but we do not guarantee that the
					service will be available at all times. We may perform maintenance, updates, or experience
					technical issues that temporarily interrupt service.
				</p>

				<div class="my-8 rounded-sm bg-warning/10 p-6 border border-warning/20">
					<div class="mb-4 flex items-center gap-3">
						<AlertCircle class="h-6 w-6 text-warning" />
						<h2 class="m-0 text-2xl font-bold">Limitation of Liability</h2>
					</div>
					<p class="m-0 text-lg">
						To the maximum extent permitted by law, HackSeeker shall not be liable for any indirect,
						incidental, special, or consequential damages arising from your use of the service. This
						includes, but is not limited to, business decisions made based on validation results.
					</p>
				</div>

				<h2>Intellectual Property</h2>
				<p>
					The HackSeeker platform, including its design, features, algorithms, and functionality, is
					owned by us and protected by intellectual property laws. You may not copy, modify, or
					create derivative works based on our platform without our express written permission.
				</p>

				<h2>Termination</h2>
				<p>
					We reserve the right to suspend or terminate your account at any time for violation of
					these Terms or for any other reason we deem necessary. You may also terminate your account
					at any time through your account settings.
				</p>

				<h2>Changes to Terms</h2>
				<p>
					We may modify these Terms at any time. We will notify users of significant changes via
					email or through the service. Continued use of the service after changes constitutes
					acceptance of the new Terms.
				</p>

				<h2>Governing Law</h2>
				<p>
					These Terms shall be governed by and construed in accordance with the laws of the
					Netherlands, without regard to conflict of law provisions.
				</p>

				<h2>Contact Information</h2>
				<p>
					If you have any questions about these Terms and Conditions, please contact us at
					support@hackseeker.com.
				</p>
			</div>
		</div>
	</section>
</div>
