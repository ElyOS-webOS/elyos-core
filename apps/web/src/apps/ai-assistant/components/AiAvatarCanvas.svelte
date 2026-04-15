<!--
  AiAvatarCanvas.svelte — Cserélhető avatar wrapper az AI asszisztenshez.

  Ez a komponens a csere-pont: az `avatarComponent` prop-on keresztül
  bármely Svelte komponens behelyettesíthető, amely implementálja az
  AvatarRenderer interfészt (fogadja az `emotionState` és `theme` prop-okat).

  Alapértelmezett avatar: RaccoonHead (Threlte-alapú 3D animált mosómedve fej)

  Requirements: 13.1, 13.3, 13.9
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import RaccoonHead from './RaccoonHead.svelte';
	import type { EmotionState } from '../types/index.js';

	interface Props {
		/** Cserélhető avatar komponens (alapértelmezett: RaccoonHead) */
		avatarComponent?: Component<{
			emotionState: EmotionState;
			theme: 'light' | 'dark';
			enableMouseTracking?: boolean;
			panelRef?: HTMLDivElement;
		}>;
		/** Az aktuális érzelmi állapot — átadódik a belső avatar komponensnek */
		emotionState: EmotionState;
		/** Az aktuális téma — átadódik a belső avatar komponensnek */
		theme: 'light' | 'dark';
		/** Opcionális: egérkövetés be/ki kapcsolása (alapértelmezett: true) */
		enableMouseTracking?: boolean;
		/** Opcionális: a panel referencia az egérkövetéshez */
		panelRef?: HTMLDivElement;
	}

	let {
		avatarComponent: AvatarComponent = RaccoonHead,
		emotionState,
		theme,
		enableMouseTracking = true,
		panelRef
	}: Props = $props();
</script>

<!--
  Reszponzív wrapper: kitölti a szülő konténert, négyzetes arány.
  aria-hidden: a 3D avatar dekoratív elem, nem igényel screen reader leírást.
  Requirements: 13.9
-->
<div class="aspect-square w-full" style="height: 100%;" aria-hidden="true">
	<AvatarComponent {emotionState} {theme} {enableMouseTracking} {panelRef} />
</div>
