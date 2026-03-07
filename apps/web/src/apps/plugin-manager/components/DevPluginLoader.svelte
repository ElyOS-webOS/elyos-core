<!--
	DevPluginLoader.svelte
	Fejlesztői plugin betöltése localhost URL-ről.
	Csak DEV_MODE=true esetén jelenik meg a Plugin Manager-ben.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import { Loader2, Play } from 'lucide-svelte/icons';
	import { toast } from 'svelte-sonner';

	// Állapotkezelés
	let url = $state('http://localhost:5174');
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

			toast.success(`Plugin "${result.plugin?.name?.en ?? result.plugin?.id}" loaded`);

			// Egyedi esemény kiváltása a plugin újratöltéséhez
			window.dispatchEvent(
				new CustomEvent('devPluginLoaded', {
					detail: result.plugin
				})
			);
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
		<Card.Title>Load Development Plugin</Card.Title>
		<Card.Description>
			Load a plugin from your local development server (localhost only)
		</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-4">
		<!-- URL beviteli mező és betöltés gomb -->
		<div class="flex gap-2">
			<Input
				bind:value={url}
				placeholder="http://localhost:5174"
				disabled={loading}
				onkeydown={handleKeydown}
				class="flex-1"
			/>
			<Button onclick={loadDevPlugin} disabled={loading || !url.trim()}>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Loading...
				{:else}
					<Play class="mr-2 h-4 w-4" />
					Load
				{/if}
			</Button>
		</div>

		<!-- Használati útmutató -->
		<div class="text-muted-foreground text-xs">
			<p>Make sure your plugin dev server is running:</p>
			<code class="bg-muted mt-1 block rounded p-2">bun dev</code>
		</div>
	</Card.Content>
</Card.Root>
