<!--
  AiFixedPanel.svelte — Fixed position panel a jobb alsó sarokban.

  Csak a 3D fejet és a platform effektet tartalmazza, átlátszó háttérrel.

  Requirements: Design document - Fixed Panel Layout section
-->
<script lang="ts">
	import { mode } from 'mode-watcher';
	import { getAiAssistantStore } from '../stores/aiAssistantStore.svelte.js';
	import AiAvatarCanvas from './AiAvatarCanvas.svelte';
	import PlatformEffect from './PlatformEffect.svelte';

	interface Props {
		isVisible: boolean;
	}

	let { isVisible }: Props = $props();

	const aiStore = getAiAssistantStore();

	/** Aktuális téma a mode-watcher alapján */
	const theme = $derived<'light' | 'dark'>(mode.current === 'dark' ? 'dark' : 'light');

	let panelRef: HTMLDivElement | undefined = $state();
</script>

<div
	bind:this={panelRef}
	class="ai-fixed-panel {isVisible ? '' : 'hidden'}"
	aria-hidden={!isVisible}
>
	<!-- 3D Avatar -->
	<div class="avatar-container relative z-10">
		<AiAvatarCanvas
			emotionState={aiStore.currentEmotion}
			{theme}
			{panelRef}
			enableMouseTracking={false}
			headAnimationMode={aiStore.headAnimationMode}
		/>
	</div>

	<!-- Platform Effect -->
	<div class="platform-container">
		<PlatformEffect {theme} />
	</div>
</div>

<style>
	.ai-fixed-panel {
		position: fixed;
		right: 1rem;
		bottom: 4rem;
		z-index: 9998;
		transition:
			opacity 0.3s ease,
			transform 0.3s ease;
		width: 280px;
		height: 280px;
		pointer-events: auto;
	}

	.ai-fixed-panel.hidden {
		transform: translateY(20px);
		opacity: 0;
		pointer-events: none;
	}

	.avatar-container {
		width: 100%;
		height: 220px;
	}

	.platform-container {
		position: relative;
		width: 100%;
		height: 60px;
		overflow: visible;
	}
</style>
