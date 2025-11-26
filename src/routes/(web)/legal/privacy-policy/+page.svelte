<script lang="ts">
	import { Shield, Lock, Eye, Download } from 'lucide-svelte';
</script>

<div class="bg-base-100">
	<section class="bg-base-200 py-16">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<div class="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
					<Shield class="h-10 w-10 text-primary" />
				</div>
				<h1 class="mb-4 text-4xl font-bold text-base-content sm:text-5xl">Privacy Policy</h1>
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
						<Lock class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Your Privacy Matters</h2>
					</div>
					<p class="m-0 text-lg">
						At cogitosoftware, we are committed to protecting your privacy and ensuring the security of
						your personal data. This Privacy Policy explains how we collect, use, and safeguard your
						information.
					</p>
				</div>

				<h2>Information We Collect</h2>
				<p>
					We collect information that you provide directly to us, including account registration
					details, story content, character information, and preferences. All story content is
					stored securely and encrypted.
				</p>

				<h2>How We Use Your Information</h2>
				<p>
					We use your information to provide, maintain, and improve our services. Your story content
					is used solely to deliver personalized experiences and is never shared with third parties
					without your explicit consent.
				</p>

				<div class="my-8 rounded-lg bg-base-200 p-6">
					<div class="mb-4 flex items-center gap-3">
						<Eye class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Data Security</h2>
					</div>
					<p class="m-0 text-lg">
						All sensitive data, including your stories and personal information, is encrypted using
						industry-standard encryption methods. We implement robust security measures to protect
						your data from unauthorized access.
					</p>
				</div>

				<h2>Your Rights</h2>
				<p>You have the right to:</p>
				<ul>
					<li>Access your personal data at any time</li>
					<li>Request deletion of your account and all associated data</li>
					<li>Export your stories and data in a portable format</li>
					<li>Modify or update your personal information</li>
					<li>Opt out of certain data processing activities</li>
				</ul>

				<div class="my-8 rounded-lg bg-primary/10 p-6">
					<div class="mb-4 flex items-center gap-3">
						<Download class="h-6 w-6 text-primary" />
						<h2 class="m-0 text-2xl font-bold">Data Export</h2>
					</div>
					<p class="m-0 text-lg">
						You can export all your stories and data at any time. Simply navigate to your account
						settings and request a data export. We'll provide you with a complete backup of your
						content.
					</p>
				</div>

				<h2>Third-Party Services</h2>
				<p>
					We may use third-party services to help us operate our platform and deliver services to
					you. These services are bound by strict confidentiality agreements and are only used for
					essential platform functions.
				</p>

				<h2>Cookies and Tracking</h2>
				<p>
					We use cookies and similar tracking technologies to enhance your experience, analyze usage
					patterns, and improve our services. You can control cookie preferences through your
					browser settings.
				</p>

				<h2>Changes to This Policy</h2>
				<p>
					We may update this Privacy Policy from time to time. We will notify you of any changes by
					posting the new Privacy Policy on this page and updating the "Last updated" date.
				</p>

				<h2>Contact Us</h2>
				<p>
					If you have any questions about this Privacy Policy or our data practices, please contact
					us through our support channels.
				</p>
			</div>
		</div>
	</section>
</div>
