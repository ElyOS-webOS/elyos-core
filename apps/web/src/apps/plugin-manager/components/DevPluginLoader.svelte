<!--
	DevPluginLoader.svelte
	Fejlesztői plugin betöltése localhost URL-ről.
	Csak DEV_MODE=true esetén jelenik meg a Plugin Manager-ben.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Loader2, Play, Info } from 'lucide-svelte/icons';
	import { toast } from 'svelte-sonner';
	import { useI18n } from '$lib/i18n/hooks';

	const { t } = useI18n();

	// Állapotkezelés
	let url = $state('http://localhost:5175');
	let loading = $state(false);

	/**
	 * Fejlesztői plugin betöltése a megadott URL-ről.
	 * Az API hívás a /api/plugins/dev/load végpontra történik.
	 */
	async function loadDevPlugin() {
		if (!url.trim() || loading) return;

		loading = true;

		try {
			const response = await fetch('/api/plugins/dev/load', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: url.trim() })
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Failed to load dev plugin');
			}

			const pluginName =
				typeof result.plugin?.name === 'object'
					? (result.plugin.name?.hu ?? result.plugin.name?.en ?? result.plugin?.id)
					: (result.plugin?.name ?? result.plugin?.id);

			// Egyedi esemény kiváltása a plugin újratöltéséhez
			window.dispatchEvent(
				new CustomEvent('devPluginLoaded', {
					detail: result.plugin
				})
			);

			toast.success(t('plugin-manager.devPlugins.loader.loadedSuccess', { name: pluginName }));
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to load dev plugin';
			toast.error(message);
		} finally {
			loading = false;
		}
	}

	/** Enter billentyű kezelése az input mezőben. */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			loadDevPlugin();
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{t('plugin-manager.devPlugins.loader.title')}</Card.Title>
		<Card.Description>
			{t('plugin-manager.devPlugins.loader.description')}
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<!-- URL beviteli mező és betöltés gomb -->
		<div class="flex gap-2">
			<Input
				bind:value={url}
				placeholder={t('plugin-manager.devPlugins.loader.urlPlaceholder')}
				disabled={loading}
				onkeydown={handleKeydown}
				class="flex-1"
			/>
			<Button onclick={loadDevPlugin} disabled={loading || !url.trim()}>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{t('plugin-manager.devPlugins.loader.loading')}
				{:else}
					<Play class="mr-2 h-4 w-4" />
					{t('plugin-manager.devPlugins.loader.load')}
				{/if}
			</Button>
		</div>

		<!-- Használati útmutató -->
		<div class="text-muted-foreground space-y-1 text-xs">
			<p>
				1. {t('plugin-manager.devPlugins.loader.step1')}
				<code class="bg-muted rounded px-1">bun run build</code>
			</p>
			<p>
				2. {t('plugin-manager.devPlugins.loader.step2')}
				<code class="bg-muted rounded px-1">bun dev-server.ts</code>
			</p>
			<p>3. {t('plugin-manager.devPlugins.loader.step3')}</p>
		</div>

		<!-- Docker hint -->
		<div class="text-muted-foreground flex items-start gap-1.5 text-xs">
			<Info class="mt-0.5 h-3 w-3 shrink-0" />
			<p>
				{@html t('plugin-manager.devPlugins.loader.dockerHint', {
					host: '<code class="bg-muted rounded px-1">host.docker.internal</code>'
				})}
			</p>
		</div>
	</Card.Content>
</Card.Root>
