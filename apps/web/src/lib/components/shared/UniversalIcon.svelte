<!-- lib/components/shared/UniversalIcon.svelte -->
<script lang="ts">
	import { loadIcon, ICON_TYPES } from '$lib/services/client/iconLoader';
	import { CircleAlert } from 'lucide-svelte'; // Fallback ikon

	interface Props {
		icon?: string;
		size?: number;
		color?: string;
		strokeWidth?: number;
		showFallback?: boolean;
		alt?: string;
		class?: string;
		appName?: string;
	}

	let {
		icon = '',
		size = 24,
		color = 'currentColor',
		strokeWidth = 2,
		showFallback = true,
		alt = '',
		class: className = '',
		appName = ''
	}: Props = $props();

	let iconData = $state<{ type: string; content: any } | null>(null);
	let loading = $state(true);
	let error = $state(false);

	// Effect - ikon változásának figyelése race condition kezeléssel
	let currentLoadId = 0;
	$effect(() => {
		const loadId = ++currentLoadId;

		(async () => {
			// Validálás: legalább az egyik (icon vagy appName) legyen megadva
			if (!icon && !appName) {
				iconData = null;
				loading = false;
				error = true;
				return;
			}

			loading = true;
			error = false;
			iconData = null; // Nullázás az új ikon betöltése előtt

			try {
				// Ha csak appName van megadva, alapértelmezett icon.svg-t használunk
				const iconToLoad = icon || 'icon.svg';
				const result = await loadIcon(iconToLoad, appName);

				// Race condition ellenőrzés - csak akkor frissítjük ha még ez az aktuális betöltés
				if (loadId === currentLoadId) {
					if (!result) {
						error = true;
					} else {
						iconData = result;
					}
				}
			} catch (err) {
				if (loadId === currentLoadId) {
					console.error('Ikon betöltési hiba:', err);
					error = true;
					iconData = null;
				}
			} finally {
				if (loadId === currentLoadId) {
					loading = false;
				}
			}
		})();
	});

	// Derived values
	const sizeStyle = $derived(`width: ${size}px; height: ${size}px;`);
	const combinedClass = $derived(`universal-icon ${className}`);
</script>

{#if loading}
	<div class="{combinedClass} loading" style={sizeStyle} aria-label="Ikon betöltése...">
		<div class="loading-spinner"></div>
	</div>
{:else if iconData}
	{#if iconData.type === ICON_TYPES.LUCIDE}
		<!-- Lucide ikon -->
		{@const LucideIcon = iconData.content}
		<LucideIcon {size} {color} stroke-width={strokeWidth} class={combinedClass} />
	{:else if iconData.type === ICON_TYPES.PRIVATE_SVG || iconData.type === ICON_TYPES.PUBLIC_SVG}
		<!-- SVG fájl (privát vagy publikus) -->
		<div class="{combinedClass} svg-container" style="{sizeStyle} color: {color};">
			{@html iconData.content}
		</div>
	{:else if iconData.type === ICON_TYPES.PRIVATE_IMAGE || iconData.type === ICON_TYPES.PUBLIC_IMAGE || iconData.type === ICON_TYPES.EXTERNAL || iconData.type === ICON_TYPES.DATA_URL}
		<!-- Képfájl (privát, publikus, külső vagy data URL) -->
		<img
			src={iconData.content}
			alt={alt || 'Ikon'}
			class="{combinedClass} image-icon"
			style={sizeStyle}
			loading="lazy"
		/>
	{/if}
{:else if error && showFallback}
	<!-- Fallback ikon -->
	<CircleAlert {size} {color} stroke-width={strokeWidth} class="{combinedClass} error" />
{:else if error}
	<!-- Üres placeholder -->
	<div class="{combinedClass} missing" style={sizeStyle} title="Ikon nem található: {icon}"></div>
{/if}

<style>
	.universal-icon {
		display: inline-flex;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
	}

	.loading {
		position: relative;
	}

	.loading-spinner {
		opacity: 0.5;
		animation: spin 1s linear infinite;
		border: 2px solid currentColor;
		border-top: 2px solid transparent;
		border-radius: 50%;
		width: 60%;
		height: 60%;
	}

	.svg-container {
		display: inline-flex;
		justify-content: center;
		align-items: center;
	}

	.svg-container :global(svg) {
		width: 100%;
		height: 100%;
	}

	.image-icon {
		border-radius: 2px;
		object-fit: contain;
	}

	.error {
		opacity: 0.5;
	}

	.missing {
		opacity: 0.1;
		border-radius: 2px;
		background-color: currentColor;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
