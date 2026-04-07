<svelte:options customElement="__PLUGIN_ID__-overview" />

<script module>
	if (typeof window !== 'undefined') {
		window.__PLUGIN_ID_UNDERSCORE___Component_Overview = function () {
			return { tagName: '__PLUGIN_ID__-overview' };
		};
	}
</script>

<script lang="ts">
	import type {} from '@elyos-dev/sdk/types';

	let { pluginId = '__PLUGIN_ID__' }: { pluginId?: string } = $props();

	let tr = $state<Record<string, string>>({});
	let loaded = $state(false);

	$effect(() => {
		const instances = (window as any).__webOS_instances;
		const i18n = (instances?.get(pluginId) || (window as any).webOS)?.i18n;
		if (!i18n) return;
		i18n.ready().then(() => {
			tr = {
				title: i18n.t('overview.title'),
				description: i18n.t('overview.description')
			};
			loaded = true;
		});
	});
</script>

{#if !loaded}
	<div style="padding: 2rem; text-align: center;">Loading...</div>
{:else}
	<section>
		<h2>{tr.title}</h2>
		<p>{tr.description}</p>
	</section>
{/if}

<style>
	section {
		padding: 2rem;
	}

	h2 {
		margin-bottom: 0.5rem;
	}

	p {
		color: var(--color-neutral-600, #4b5563);
	}
</style>
