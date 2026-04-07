<svelte:options customElement="__PLUGIN_ID__-settings" />

<script module>
	if (typeof window !== 'undefined') {
		window.__PLUGIN_ID_UNDERSCORE___Component_Settings = function () {
			return { tagName: '__PLUGIN_ID__-settings' };
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
				title: i18n.t('settings.title'),
				name: i18n.t('settings.name'),
				save: i18n.t('settings.save')
			};
			loaded = true;
		});
	});

	let name = $state('');

	async function saveName() {
		if (!name.trim()) {
			sdk?.ui.toast('Name is required', 'warning');
			return;
		}
		await sdk?.data.set('user-name', name);
		sdk?.ui.toast((tr.save ?? 'settings.save') + ' ✓', 'success');
	}

</script>

{#if !loaded}
	<div style="padding: 2rem; text-align: center;">Loading...</div>
{:else}
	<section>
		<h2>{tr.title}</h2>

		<div class="setting-item">
			<label>
				{tr.name}
				<input type="text" bind:value={name} />
			</label>
			<button onclick={saveName}>{tr.save}</button>
		</div>
	</section>
{/if}

<style>
	section {
		padding: 2rem;
	}

	h2 {
		margin-bottom: 1rem;
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 300px;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	input {
		border: 1px solid var(--color-neutral-300, #d1d5db);
		border-radius: 0.25rem;
		padding: 0.5rem;
	}

	button {
		cursor: pointer;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
		width: fit-content;
	}
</style>
