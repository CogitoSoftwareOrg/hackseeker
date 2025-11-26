<script lang="ts">
	import { Shield, Lock, Eye, Download, Database, Bot } from 'lucide-svelte';
</script>

<div class="bg-base-100">
	<section class="bg-base-200/50 py-20">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<div class="mb-6 inline-flex items-center justify-center rounded-sm bg-primary/10 p-4">
					<Shield class="h-10 w-10 text-primary" />
				</div>
				<h1 class="mb-4 text-4xl font-bold text-base-content sm:text-5xl">Privacy Policy</h1>
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
						<Lock class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Your Privacy Matters</h2>
					</div>
					<p class="m-0 text-lg">
						At HackSeeker, we are committed to protecting your privacy and ensuring the security of
						your personal data. This Privacy Policy explains how we collect, use, and safeguard your
						information.
					</p>
				</div>

				<h2>Information We Collect</h2>
				<p>We collect information that you provide directly to us, including:</p>
				<ul>
					<li>Account registration details (email, name)</li>
					<li>Product ideas and validation queries you submit</li>
					<li>Chat conversations with our AI assistant</li>
					<li>Generated landing pages and lead data</li>
					<li>Payment information (processed securely via Stripe)</li>
					<li>Usage data and preferences</li>
				</ul>

				<h2>How We Use Your Information</h2>
				<p>We use your information to:</p>
				<ul>
					<li>Provide and improve HackSeeker's validation services</li>
					<li>Generate market research and analysis for your ideas</li>
					<li>Create landing pages and collect leads on your behalf</li>
					<li>Process payments and manage subscriptions</li>
					<li>Send service updates and relevant communications</li>
					<li>Improve our AI models and algorithms (using anonymized data)</li>
				</ul>

				<div class="my-8 rounded-sm bg-base-200/50 p-6 border border-base-content/5">
					<div class="mb-4 flex items-center gap-3">
						<Bot class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">AI & Data Processing</h2>
					</div>
					<p class="m-0 text-lg">
						Your ideas and queries are processed by AI models to generate validation insights. We use
						third-party AI services (such as OpenAI) to power our analysis. Your data is transmitted
						securely and is not used to train these third-party models.
					</p>
				</div>

				<div class="my-8 rounded-sm bg-base-200/50 p-6 border border-base-content/5">
					<div class="mb-4 flex items-center gap-3">
						<Eye class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Data Security</h2>
					</div>
					<p class="m-0 text-lg">
						All sensitive data, including your ideas and validation results, is encrypted using
						industry-standard encryption methods. We implement robust security measures to protect
						your data from unauthorized access.
					</p>
				</div>

				<h2>Your Rights</h2>
				<p>You have the right to:</p>
				<ul>
					<li>Access your personal data at any time</li>
					<li>Request deletion of your account and all associated data</li>
					<li>Export your validation reports and data</li>
					<li>Modify or update your personal information</li>
					<li>Opt out of marketing communications</li>
					<li>Request a copy of your data in a portable format</li>
				</ul>

				<div class="my-8 rounded-sm bg-primary/10 p-6 border border-primary/20">
					<div class="mb-4 flex items-center gap-3">
						<Download class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Data Export & Deletion</h2>
					</div>
					<p class="m-0 text-lg">
						You can export all your validation data and reports at any time from your account
						settings. To request complete deletion of your account and all associated data, please
						contact us or use the delete account option in settings.
					</p>
				</div>

				<h2>Third-Party Services</h2>
				<p>We use third-party services to help us operate HackSeeker:</p>
				<ul>
					<li><strong>OpenAI</strong> - AI-powered analysis and insights</li>
					<li><strong>Stripe</strong> - Payment processing</li>
					<li><strong>Analytics services</strong> - To understand usage patterns</li>
					<li><strong>Search APIs</strong> - To gather market data</li>
				</ul>
				<p>
					These services are bound by their respective privacy policies and are only used for
					essential platform functions.
				</p>

				<h2>Cookies and Tracking</h2>
				<p>
					We use cookies and similar tracking technologies to enhance your experience, maintain
					sessions, analyze usage patterns, and improve our services. You can control cookie
					preferences through your browser settings.
				</p>

				<h2>Data Retention</h2>
				<p>
					We retain your data for as long as your account is active or as needed to provide services.
					Validation reports and chat history are kept for your reference. You can request deletion at
					any time, and we will remove your data within 30 days, except where retention is required by
					law.
				</p>

				<h2>Changes to This Policy</h2>
				<p>
					We may update this Privacy Policy from time to time. We will notify you of any changes by
					posting the new Privacy Policy on this page, updating the "Last updated" date, and sending
					an email notification for significant changes.
				</p>

				<h2>Contact Us</h2>
				<p>
					If you have any questions about this Privacy Policy or our data practices, please contact
					us at privacy@hackseeker.com.
				</p>
			</div>
		</div>
	</section>
</div>
