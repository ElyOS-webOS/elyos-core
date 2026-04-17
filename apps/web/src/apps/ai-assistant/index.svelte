<!--
  AI Asszisztens — Főkomponens (alkalmazás ablak).

  Menü-alapú elrendezés: Beállítások és Telepítés menüpontok.
  Az AI asszisztens chat funkció a taskbar ikonon keresztül érhető el (AiFixedPanel).

  Requirements: 3.1, 3.2
-->
<script lang="ts">
	import { AppLayout } from '$lib/components/shared';
	import { createAppShell } from '$lib/apps/appShell.svelte';
	import type { RawMenuItem } from '$lib/types/menu';
	import menuData from './menu.json';

	// App shell a menü-alapú navigációhoz
	const shell = createAppShell({
		appName: 'ai-assistant',
		menuData: menuData as RawMenuItem[]
	});
</script>

<div class="ai-assistant-app">
	<AppLayout {shell} namespaces={['ai-assistant']} sidebarWidth={180} />
</div>

<style>
	.ai-assistant-app {
		height: 100%;
		overflow: hidden;
	}
</style>
