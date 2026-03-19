<svelte:options customElement="sdk-demo-overview" />

<script module>
	// Factory function export for dynamic loading
	if (typeof window !== 'undefined') {
		window.sdk_demo_Component_Overview = function () {
			return {
				tagName: 'sdk-demo-overview'
			};
		};
	}
</script>

<script lang="ts">
	import { Heart } from '@lucide/svelte';
	import type {} from '@elyos/sdk/types';

	let { pluginId = 'sdk-demo' }: { pluginId?: string } = $props();

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
</script>

{#if !translationsLoaded}
	<div style="padding: 2rem; text-align: center;">Loading translations...</div>
{:else}
	<section>
		<h2>{sdk?.i18n.t('overview.title')}</h2>
		<div class="overview-content">
			<div class="icon-wrapper">
				<Heart size={64} color="#667eea" />
			</div>
			<p>{sdk?.i18n.t('overview.description')}</p>
			<div class="features">
				<h3>{sdk?.i18n.t('overview.features')}</h3>
				<ul>
					<li>{sdk?.i18n.t('overview.feature_ui')}</li>
					<li>{sdk?.i18n.t('overview.feature_data')}</li>
					<li>{sdk?.i18n.t('overview.feature_remote')}</li>
					<li>{sdk?.i18n.t('overview.feature_i18n')}</li>
					<li>{sdk?.i18n.t('overview.feature_notifications')}</li>
				</ul>
			</div>
		</div>
	</section>
{/if}

<style>
	.overview-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 2rem;
	}

	.icon-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem;
	}

	.features {
		width: 100%;
		max-width: 600px;
	}

	.features h3 {
		margin-bottom: 1rem;
		color: var(--color-neutral-700);
		font-size: 1.25rem;
	}

	.features ul {
		padding: 0;
		list-style: none;
	}

	.features li {
		position: relative;
		margin-bottom: 0.5rem;
		padding-left: 1.5rem;
	}

	.features li::before {
		position: absolute;
		left: 0;
		content: '✓';
		color: #667eea;
		font-weight: bold;
	}
</style>
