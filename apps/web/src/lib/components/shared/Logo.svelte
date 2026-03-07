<script lang="ts">
	interface Props {
		title?: string;
		variant?: 'default' | 'sidebar';
	}

	let { title, variant = 'default' }: Props = $props();
</script>

<div class="flex items-center gap-2">
	<div class="flex h-10 w-10 shrink-0 items-center justify-center">
		<svg viewBox="0 0 40 40" class="h-10 w-10">
			<defs>
				<linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style="stop-color:#60a5fa" />
					<stop offset="100%" style="stop-color:#1d4ed8" />
				</linearGradient>
			</defs>
			<circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
			<circle cx="14" cy="16" r="6" fill="#1e40af" opacity="0.8" />
			<circle cx="24" cy="22" r="4" fill="#93c5fd" opacity="0.9" />
		</svg>
	</div>
	<span
		class="leading-tight font-semibold"
		class:text-lg={variant === 'default'}
		class:text-gray-800={variant === 'default'}
		class:text-sm={variant === 'sidebar'}
		class:text-white={variant === 'sidebar'}
	>
		{title || ''}
	</span>
</div>
