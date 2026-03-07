<!--
	DevPlugins.svelte
	Fejlesztői plugin kezelő oldal a Plugin Manager-ben.
	Integrálja a DevPluginLoader komponenst, kezeli a betöltött dev pluginok listáját,
	és támogatja a hot reload-ot Vite HMR-en keresztül.
	Csak DEV_MODE=true esetén érhető el.
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import DevPluginLoader from './DevPluginLoader.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { RefreshCw, Trash2, ExternalLink, Code, Play, Wifi, WifiOff } from 'lucide-svelte/icons';
	import { toast } from 'svelte-sonner';
	import { useI18n } from '$lib/i18n/hooks';
	import { getWindowManager } from '$lib/stores';

	const { t } = useI18n();
	const windowManager = getWindowManager();

	/** Dev plugin metaadatok típusa */
	interface DevPlugin {
		id: string;
		name: Record<string, string> | string;
		version: string;
		devUrl: string;
		entry: string;
		devMode: boolean;
		loadedAt: Date;
		/** HMR WebSocket kapcsolat állapota */
		hmrConnected?: boolean;
	}

	// Betöltött fejlesztői pluginok registrye
	let devPlugins = $state<DevPlugin[]>([]);

	// Aktív HMR WebSocket kapcsolatok
	const hmrSockets = new SvelteMap<string, WebSocket>();

	/** Plugin megjelenítendő neve */
	function getPluginDisplayName(plugin: DevPlugin): string {
		if (typeof plugin.name === 'string') return plugin.name;
		return plugin.name?.en ?? plugin.name?.hu ?? plugin.id;
	}

	/**
	 * Vite HMR WebSocket kapcsolat létrehozása a dev plugin szerveréhez.
	 * Figyeli a Vite HMR frissítési eseményeket és automatikusan újratölti a plugint.
	 */
	function connectHMR(plugin: DevPlugin) {
		// Meglévő kapcsolat bontása
		disconnectHMR(plugin.id);

		try {
			const url = new URL(plugin.devUrl);
			const wsUrl = `ws://${url.host}`;
			const ws = new WebSocket(wsUrl);

			ws.addEventListener('open', () => {
				console.log(`[DevPlugins] HMR connected: ${plugin.id} → ${wsUrl}`);
				updatePluginHmrState(plugin.id, true);
			});

			ws.addEventListener('message', (event) => {
				try {
					const data = JSON.parse(event.data);

					// Vite HMR frissítési események figyelése
					if (data.type === 'update' || data.type === 'full-reload') {
						console.log(`[DevPlugins] HMR update for ${plugin.id}:`, data.type);
						handleHmrReload(plugin);
					}
				} catch {
					// Nem JSON üzenet — figyelmen kívül hagyjuk
				}
			});

			ws.addEventListener('close', () => {
				console.log(`[DevPlugins] HMR disconnected: ${plugin.id}`);
				updatePluginHmrState(plugin.id, false);
				hmrSockets.delete(plugin.id);
			});

			ws.addEventListener('error', () => {
				console.warn(`[DevPlugins] HMR connection error: ${plugin.id}`);
				updatePluginHmrState(plugin.id, false);
			});

			hmrSockets.set(plugin.id, ws);
		} catch (err) {
			console.warn(`[DevPlugins] Failed to connect HMR for ${plugin.id}:`, err);
		}
	}

	/** HMR WebSocket kapcsolat bontása */
	function disconnectHMR(pluginId: string) {
		const ws = hmrSockets.get(pluginId);
		if (ws) {
			ws.close();
			hmrSockets.delete(pluginId);
		}
	}

	/** Plugin HMR állapot frissítése a registryben */
	function updatePluginHmrState(pluginId: string, connected: boolean) {
		const idx = devPlugins.findIndex((p) => p.id === pluginId);
		if (idx >= 0) {
			devPlugins[idx] = { ...devPlugins[idx], hmrConnected: connected };
		}
	}

	/**
	 * HMR frissítés kezelése — plugin újratöltése a dev szerverről.
	 * Debounce-olva, hogy ne töltse újra többször gyors egymásutánban.
	 */
	const hmrReloadTimers = new SvelteMap<string, ReturnType<typeof setTimeout>>();

	function handleHmrReload(plugin: DevPlugin) {
		// Debounce: 500ms-on belüli többszörös HMR esemény összevonása
		const existing = hmrReloadTimers.get(plugin.id);
		if (existing) clearTimeout(existing);

		const timer = setTimeout(() => {
			hmrReloadTimers.delete(plugin.id);
			reloadPlugin(plugin);
		}, 500);

		hmrReloadTimers.set(plugin.id, timer);
	}

	/**
	 * devPluginLoaded esemény kezelése — új plugin hozzáadása vagy meglévő frissítése.
	 * A DevPluginLoader komponens váltja ki ezt az eseményt sikeres betöltés után.
	 */
	function handleDevPluginLoaded(event: CustomEvent<DevPlugin>) {
		const pluginData = event.detail;
		if (!pluginData?.id) return;

		const existingIndex = devPlugins.findIndex((p) => p.id === pluginData.id);

		if (existingIndex >= 0) {
			// Meglévő plugin frissítése (hot reload)
			devPlugins[existingIndex] = {
				...pluginData,
				loadedAt: new Date(),
				hmrConnected: devPlugins[existingIndex].hmrConnected
			};
			toast.info(`Plugin "${getPluginDisplayName(pluginData)}" reloaded`);
		} else {
			// Új plugin hozzáadása és HMR kapcsolat létrehozása
			const newPlugin = { ...pluginData, loadedAt: new Date() };
			devPlugins = [...devPlugins, newPlugin];
			connectHMR(newPlugin);
		}
	}

	/**
	 * Plugin eltávolítása a dev registry-ből és HMR kapcsolat bontása.
	 */
	function removePlugin(pluginId: string) {
		const plugin = devPlugins.find((p) => p.id === pluginId);
		disconnectHMR(pluginId);
		devPlugins = devPlugins.filter((p) => p.id !== pluginId);
		if (plugin) {
			toast.success(`Plugin "${getPluginDisplayName(plugin)}" removed`);
		}
	}

	/**
	 * Plugin újratöltése a dev szerverről.
	 */
	async function reloadPlugin(plugin: DevPlugin) {
		try {
			const response = await fetch('/api/plugins/dev/load', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: plugin.devUrl })
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Failed to reload plugin');
			}

			// Registry frissítése
			const idx = devPlugins.findIndex((p) => p.id === plugin.id);
			if (idx >= 0) {
				devPlugins[idx] = {
					...result.plugin,
					loadedAt: new Date(),
					hmrConnected: devPlugins[idx].hmrConnected
				};
			}

			toast.success(`Plugin "${getPluginDisplayName(plugin)}" reloaded`);

			// Egyedi esemény kiváltása a rendszer többi részének
			window.dispatchEvent(new CustomEvent('devPluginLoaded', { detail: result.plugin }));
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to reload plugin';
			toast.error(message);
		}
	}

	/**
	 * Dev plugin megnyitása az asztalon a WindowManager-en keresztül.
	 * A plugin entry point-ját tölti be a rendszerben.
	 */
	function openPlugin(plugin: DevPlugin) {
		const displayName = getPluginDisplayName(plugin);

		windowManager.openWindow(
			`dev:${plugin.id}`,
			`${displayName} (DEV)`,
			{
				icon: 'code',
				defaultSize: { width: 800, height: 600 },
				minSize: { width: 400, height: 300 }
			},
			{
				devMode: true,
				devUrl: plugin.devUrl,
				entry: plugin.entry
			}
		);
	}

	// Globális eseményfigyelő a devPluginLoaded eseményhez
	onMount(() => {
		window.addEventListener('devPluginLoaded', handleDevPluginLoaded as EventListener);
	});

	onDestroy(() => {
		window.removeEventListener('devPluginLoaded', handleDevPluginLoaded as EventListener);

		// Összes HMR kapcsolat bontása
		for (const [pluginId] of hmrSockets) {
			disconnectHMR(pluginId);
		}

		// Debounce timerek törlése
		for (const timer of hmrReloadTimers.values()) {
			clearTimeout(timer);
		}
		hmrReloadTimers.clear();
	});
</script>

<div class="title-block">
	<h2>{t('plugin-manager.devPlugins.title')}</h2>
	<h3>{t('plugin-manager.devPlugins.description')}</h3>
</div>

<div class="space-y-6">
	<!-- Dev Plugin Loader komponens -->
	<DevPluginLoader />

	<!-- Betöltött dev pluginok listája -->
	{#if devPlugins.length > 0}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Code class="h-4 w-4" />
					{t('plugin-manager.devPlugins.loaded')}
					<Badge variant="secondary">{devPlugins.length}</Badge>
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-3">
					{#each devPlugins as plugin (plugin.id)}
						<div class="flex items-center justify-between rounded-lg border p-3">
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span class="font-medium">{getPluginDisplayName(plugin)}</span>
									<Badge variant="outline" class="text-xs">v{plugin.version}</Badge>
									<Badge variant="secondary" class="text-xs">DEV</Badge>
									{#if plugin.hmrConnected}
										<Badge variant="outline" class="text-xs text-green-600">
											<Wifi class="mr-1 h-3 w-3" />
											HMR
										</Badge>
									{:else}
										<Badge variant="outline" class="text-muted-foreground text-xs">
											<WifiOff class="mr-1 h-3 w-3" />
											HMR
										</Badge>
									{/if}
								</div>
								<div class="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
									<ExternalLink class="h-3 w-3" />
									<span class="truncate">{plugin.devUrl}</span>
								</div>
							</div>
							<div class="flex items-center gap-1">
								<Button variant="ghost" size="icon" onclick={() => openPlugin(plugin)} title="Open">
									<Play class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => reloadPlugin(plugin)}
									title="Reload"
								>
									<RefreshCw class="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									onclick={() => removePlugin(plugin.id)}
									title="Remove"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
