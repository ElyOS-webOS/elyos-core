<svelte:options customElement="sdk-demo-plugin" />

<script lang="ts">
	/**
	 * Hello World Plugin - Layout Mode
	 *
	 * Ez a plugin a WebOS AppLayout rendszerét használja.
	 * A komponensek a menu.json alapján töltődnek be dinamikusan.
	 */

	// Props from custom element attributes
	let { pluginId = 'sdk-demo' }: { pluginId?: string } = $props();
</script>

<div class="plugin-placeholder">
	<p>Plugin loaded with layout mode. Components are loaded dynamically via menu.</p>
	<p>Plugin ID: {pluginId}</p>
</div>

<style>
	.plugin-placeholder {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		padding: 2rem;
		height: 100%;
		color: var(--color-neutral-600);
		font-size: 0.875rem;
		text-align: center;
	}
</style>
