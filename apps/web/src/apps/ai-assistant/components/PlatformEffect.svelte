<!--
  PlatformEffect.svelte — Ovális platform effekt a 3D fej alatt.

  Vizuális megjelenés: 3D perspektívával elforgatott ovális, amely azt a hatást kelti,
  mintha a fej lebegne rajta. Primary color gradient háttér, blur effekt, pulse animáció.

  Requirements: Design document - Platform Effect section
-->
<script lang="ts">
	interface Props {
		theme: 'light' | 'dark';
	}

	let { theme }: Props = $props();
</script>

<div class="platform-oval" aria-hidden="true"></div>

<style>
	.platform-oval {
		position: absolute;
		top: -30px;
		left: 50%;

		transform: translateX(-50%) perspective(400px) rotateX(60deg);
		z-index: 1;
		filter: blur(14px);
		animation: platform-pulse 3s ease-in-out infinite;
		border-radius: 50%;

		/* Primary color használata CSS változóval */
		background: radial-gradient(
			ellipse at center,
			color-mix(in srgb, var(--primary) 60%, transparent) 0%,
			color-mix(in srgb, var(--primary) 40%, transparent) 50%,
			color-mix(in srgb, var(--primary) 15%, transparent) 100%
		);
		width: 200px;
		height: 60px;
		pointer-events: none;
	}

	@keyframes platform-pulse {
		0%,
		100% {
			transform: translateX(-50%) perspective(400px) rotateX(60deg) scale(1);
			opacity: 0.7;
		}
		50% {
			transform: translateX(-50%) perspective(400px) rotateX(60deg) scale(1.05);
			opacity: 0.9;
		}
	}
</style>
