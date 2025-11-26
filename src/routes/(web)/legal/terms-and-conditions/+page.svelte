<script lang="ts">
	import { FileText, AlertCircle, CheckCircle, Scale } from 'lucide-svelte';
</script>

<div class="bg-base-100">
	<section class="bg-base-200 py-16">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<div class="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
					<FileText class="h-10 w-10 text-primary" />
				</div>
				<h1 class="mb-4 text-4xl font-bold text-base-content sm:text-5xl">Terms and Conditions</h1>
				<p class="text-xl text-base-content/70">Last updated: November 2025</p>
			</div>
		</div>
	</section>

	<section class="py-16">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div
				class="mx-auto prose prose-lg max-w-4xl prose-headings:text-base-content prose-p:text-base-content/80 prose-strong:text-base-content"
			>
				<div class="mb-8 rounded-lg bg-base-200 p-6">
					<div class="mb-4 flex items-center gap-3">
						<Scale class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Agreement to Terms</h2>
					</div>
					<p class="m-0 text-lg">
						By accessing and using Cogito Software, you agree to be bound by these Terms and Conditions. If
						you do not agree with any part of these terms, you may not use our service.
					</p>
				</div>

				<h2>Acceptable Use</h2>
				<p>
					You agree to use Cogito Software only for lawful purposes and in accordance with these Terms.
				</p>
				<p>You agree not to:</p>
				<ul>
					<li>Use the service to create content that violates any applicable laws</li>
					<li>Impersonate any person or entity</li>
					<li>Attempt to gain unauthorized access to our systems</li>
					<li>Interfere with or disrupt the service or servers</li>
					<li>Use automated systems to access the service without permission</li>
				</ul>

				<div class="my-8 rounded-lg bg-base-200 p-6">
					<div class="mb-4 flex items-center gap-3">
						<CheckCircle class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">User Content</h2>
					</div>
					<p class="m-0 text-lg">
						You retain all rights to the content you create on Cogito Software. You are solely responsible
						for the content you create and ensure it complies with these Terms. We reserve the right
						to remove content that violates our policies.
					</p>
				</div>

				<h2>Account Responsibility</h2>
				<p>
					You are responsible for maintaining the confidentiality of your account credentials and
					for all activities that occur under your account. You agree to notify us immediately of
					any unauthorized use of your account.
				</p>

				<h2>Service Availability</h2>
				<p>
					We strive to provide continuous access to our service, but we do not guarantee that the
					service will be available at all times. We may perform maintenance, updates, or experience
					technical issues that temporarily interrupt service.
				</p>

				<div class="my-8 rounded-lg bg-warning/10 p-6">
					<div class="mb-4 flex items-center gap-3">
						<AlertCircle class="h-6 w-6 text-warning" />
						<h2 class="m-0 text-2xl font-bold">Limitation of Liability</h2>
					</div>
					<p class="m-0 text-lg">
						To the maximum extent permitted by law, Cogito Software shall not be liable for any indirect,
						incidental, special, or consequential damages arising from your use of the service.
					</p>
				</div>

				<h2>Intellectual Property</h2>
				<p>
					The Cogito Software platform, including its design, features, and functionality, is owned by us
					and protected by intellectual property laws. You may not copy, modify, or create
					derivative works based on our platform without our express written permission.
				</p>

				<h2>Termination</h2>
				<p>
					We reserve the right to suspend or terminate your account at any time for violation of
					these Terms or for any other reason we deem necessary. You may also terminate your account
					at any time through your account settings.
				</p>

				<h2>Changes to Terms</h2>
				<p>
					We may modify these Terms at any time. We will notify users of significant changes, and
					continued use of the service after changes constitutes acceptance of the new Terms.
				</p>

				<h2>Governing Law</h2>
				<p>
					These Terms shall be governed by and construed in accordance with applicable laws, without
					regard to conflict of law provisions.
				</p>

				<h2>Contact Information</h2>
				<p>
					If you have any questions about these Terms and Conditions, please contact us through our
					support channels.
				</p>
			</div>
		</div>
	</section>
</div>
