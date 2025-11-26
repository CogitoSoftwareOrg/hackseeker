<div class="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-base-100">
	<!-- Gradient Base -->
	<div
		class="absolute inset-0 bg-linear-to-b from-base-100 via-primary/5 to-secondary/10 opacity-50"
	></div>

	<!-- Geometric Pattern -->
	<svg
		class="absolute h-full w-full opacity-30 dark:opacity-20"
		viewBox="0 0 100 100"
		preserveAspectRatio="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs>
			<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:0.1"></stop>
				<stop offset="100%" style="stop-color:var(--color-secondary);stop-opacity:0.1"></stop>
			</linearGradient>
		</defs>

		<!-- Angular Lines / Constellation effect -->
		<path
			d="M0 100 L20 80 L40 100 L60 60 L80 90 L100 70 V100 H0 Z"
			fill="url(#grad1)"
			stroke="currentColor"
			stroke-width="0.1"
			class="text-primary/20"
		></path>
		<path
			d="M0 0 L30 20 L50 0 L70 30 L100 10 V0 H0 Z"
			fill="url(#grad1)"
			stroke="currentColor"
			stroke-width="0.1"
			class="text-secondary/20"
		></path>

		<!-- Floating Polygons -->
		<polygon
			points="10,10 20,30 30,10"
			fill="none"
			stroke="currentColor"
			stroke-width="0.1"
			class="text-primary/10"
		></polygon>
		<polygon
			points="80,80 90,60 70,70"
			fill="none"
			stroke="currentColor"
			stroke-width="0.1"
			class="text-secondary/10"
		></polygon>
		<polygon
			points="50,50 60,40 70,50 60,60"
			fill="none"
			stroke="currentColor"
			stroke-width="0.1"
			class="text-accent/10"
		></polygon>

		<!-- Connecting Lines -->
		<line
			x1="20"
			y1="30"
			x2="50"
			y2="50"
			stroke="currentColor"
			stroke-width="0.05"
			class="text-base-content/10"
		></line>
		<line
			x1="50"
			y1="50"
			x2="80"
			y2="80"
			stroke="currentColor"
			stroke-width="0.05"
			class="text-base-content/10"
		></line>
		<line
			x1="70"
			y1="30"
			x2="60"
			y2="60"
			stroke="currentColor"
			stroke-width="0.05"
			class="text-base-content/10"
		></line>
	</svg>

	<!-- Noise Texture for "Paper/Terminal" feel -->
	<div
		class="absolute inset-0 opacity-[0.03] mix-blend-overlay"
		style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E');"
	></div>
</div>
