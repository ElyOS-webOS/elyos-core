<svelte:options customElement="hello-world-settings" />

<script module>
	// Factory function export for dynamic loading
	if (typeof window !== 'undefined') {
		window.hello_world_Component_Settings = function () {
			return {
				tagName: 'hello-world-settings'
			};
		};
	}
</script>

<script lang="ts">
	import { Settings as SettingsIcon } from '@lucide/svelte';
	import type {} from '@elyos/sdk/types';

	let { pluginId = 'hello-world' }: { pluginId?: string } = $props();

	// WebOS SDK elérése
	let sdk = $derived.by(() => {
		const instances = (window as any).__webOS_instances;
		return instances?.get(pluginId) || window.webOS;
	});

	// Fordítások betöltése
	let translationsLoaded = $state(false);

	$effect(() => {
		if (sdk?.i18n) {
			// Ellenőrizzük, hogy már be vannak-e töltve
			const checkLoaded = async () => {
				await sdk.i18n.ready();
				translationsLoaded = true;
			};
			checkLoaded();
		}
	});

	// Beállítások
	let setting1 = $state(true);
	let setting2 = $state('option1');
</script>

{#if !translationsLoaded}
	<div style="padding: 2rem; text-align: center;">Loading translations...</div>
{:else}
	<section>
		<h2>{sdk?.i18n.t('settings.title')}</h2>
		<div class="settings-content">
			<div class="icon-wrapper">
				<SettingsIcon size={48} color="#667eea" />
			</div>
			<p>{sdk?.i18n.t('settings.description')}</p>

			<div class="setting-item">
				<label>
					<input type="checkbox" bind:checked={setting1} />
					{sdk?.i18n.t('settings.option1')}
				</label>
			</div>

			<div class="setting-item">
				<label>
					{sdk?.i18n.t('settings.option2')}
					<select bind:value={setting2}>
						<option value="option1">{sdk?.i18n.t('settings.choice1')}</option>
						<option value="option2">{sdk?.i18n.t('settings.choice2')}</option>
						<option value="option3">{sdk?.i18n.t('settings.choice3')}</option>
					</select>
				</label>
			</div>
		</div>
	</section>
{/if}

<style>
	.settings-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 2rem;
	}

	.icon-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 1rem;
		width: 64px;
		height: 64px;
	}

	.setting-item {
		border: 1px solid var(--color-neutral-300);
		border-radius: 8px;
		padding: 1rem;
	}

	.setting-item label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	select {
		margin-left: auto;
		border: 1px solid var(--color-neutral-300);
		border-radius: 4px;
		padding: 0.25rem 0.5rem;
	}
</style>
