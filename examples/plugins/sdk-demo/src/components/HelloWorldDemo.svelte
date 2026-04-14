<svelte:options customElement="sdk-demo-demo" />

<script module>
	// Factory function export for dynamic loading
	if (typeof window !== 'undefined') {
		window.sdk_demo_Component_HelloWorldDemo = function () {
			return {
				tagName: 'sdk-demo-demo'
			};
		};
	}
</script>

<script lang="ts">
	/**
	 * SDK Demo Component
	 *
	 * Ez a komponens bemutatja a WebOS SDK összes funkcióját:
	 * - UI Service (toast, komponensek)
	 * - Remote Service (szerver oldali függvények)
	 * - Data Service (adattárolás)
	 * - I18n Service (fordítások)
	 * - Notification Service (értesítések)
	 * - Context Service (alkalmazás kontextus)
	 * - Asset Service (képek, ikonok)
	 */

	import { onMount } from 'svelte';
	import { Heart } from '@lucide/svelte';
	import type {} from '@racona/sdk/types';

	let { pluginId = 'sdk-demo' }: { pluginId?: string } = $props();

	// WebOS SDK elérése plugin ID alapján - minden ablaknak saját SDK instance-a van
	let sdk = $derived.by(() => {
		const instances = (window as any).__webOS_instances;
		const instance = instances?.get(pluginId);
		console.log('[Plugin] Looking for SDK instance:', {
			pluginId,
			instances,
			instance,
			fallback: window.webOS
		});
		return instance || window.webOS;
	});

	// Várjuk meg az I18n service betöltését
	let translationsLoaded = $state(false);

	$effect(() => {
		if (sdk?.i18n) {
			sdk.i18n.ready().then(() => {
				translationsLoaded = true;
			});
		}
	});

	// Állapotok
	let counter = $state(0);
	let userName = $state('');
	let savedData = $state<any>(null);
	let remoteResult = $state<any>(null);

	// Plugin kontextus információk - derived, hogy reaktívak legyenek
	const user = $derived(sdk?.context.user);
	const params = $derived(sdk?.context.params);

	// Komponens betöltésekor
	onMount(async () => {
		// Várjuk meg a fordítások betöltését
		await sdk?.i18n.ready();

		// Toast üdvözlés
		sdk?.ui.toast(sdk.i18n.t('welcome') || 'Welcome to Hello World Plugin!', 'success');

		// Mentett számláló betöltése
		try {
			const saved = await sdk?.data.get<number>('counter');
			if (saved !== null && saved !== undefined) {
				counter = saved;
			}
		} catch (error) {
			console.error('Failed to load counter:', error);
		}

		// Felhasználó név betöltése
		try {
			const name = await sdk?.data.get<string>('userName');
			if (name) {
				userName = name;
			}
		} catch (error) {
			console.error('Failed to load userName:', error);
		}
	});

	// Számláló növelése
	async function incrementCounter() {
		counter++;
		await sdk?.data.set('counter', counter);
		sdk?.ui.toast(sdk.i18n.t('counter_updated', { count: counter }), 'info');
	}

	// Felhasználó név mentése
	async function saveUserName() {
		if (!userName.trim()) {
			sdk?.ui.toast(sdk.i18n.t('name_required'), 'warning');
			return;
		}

		await sdk?.data.set('userName', userName);
		sdk?.ui.toast(sdk.i18n.t('name_saved'), 'success');
	}

	// Mentett adatok betöltése
	async function loadSavedData() {
		try {
			const data = await sdk?.data.query<any>(
				'SELECT key, value FROM kv_store ORDER BY created_at DESC LIMIT 5'
			);
			savedData = data;
			sdk?.ui.toast(sdk.i18n.t('data_loaded'), 'success');
		} catch (error) {
			sdk?.ui.toast('Hiba az adatok betöltésekor', 'error');
			console.error(error);
		}
	}

	// Remote függvény hívása
	async function callRemoteFunction() {
		try {
			const result = await sdk?.remote.call('getServerTime', {
				format: 'ISO'
			});
			remoteResult = result;
			sdk?.ui.toast(sdk.i18n.t('remote_success'), 'success');
		} catch (error) {
			sdk?.ui.toast('Hiba a remote függvény hívásakor', 'error');
			console.error(error);
		}
	}

	// Értesítés küldése
	async function sendNotification() {
		try {
			await sdk?.notifications.send({
				userId: user?.id || 'unknown',
				title: sdk.i18n.t('notification_title'),
				message: sdk.i18n.t('notification_message'),
				type: 'info'
			});
			sdk?.ui.toast(sdk.i18n.t('notification_sent'), 'success');
		} catch (error) {
			sdk?.ui.toast('Hiba az értesítés küldésekor', 'error');
			console.error(error);
		}
	}

	// Ablak bezárása
	function closeWindow() {
		sdk?.context.window.close();
	}

	// Ablak cím módosítása
	function changeTitle() {
		sdk?.context.window.setTitle(`Hello World - ${counter}`);
	}
</script>

{#if !translationsLoaded}
	<div class="plugin-container">
		<div style="padding: 2rem; text-align: center;">Loading translations...</div>
	</div>
{:else}
	<div class="plugin-container">
		<!-- Header -->
		<header class="plugin-header">
			<div class="plugin-icon-wrapper">
				<Heart size={48} color="#667eea" />
			</div>
			<div>
				<h1>{sdk?.i18n.t('title')}</h1>
				<p class="subtitle">{sdk?.i18n.t('subtitle')}</p>
			</div>
		</header>

		<!-- Plugin Info -->
		<section class="info-section">
			<h2>{sdk?.i18n.t('plugin_info')}</h2>
			<div class="info-grid">
				<div class="info-item">
					<strong>App ID:</strong>
					{pluginId}
				</div>
				<div class="info-item">
					<strong>{sdk?.i18n.t('user')}:</strong>
					{user?.name || 'Unknown'}
				</div>
				<div class="info-item">
					<strong>{sdk?.i18n.t('language')}:</strong>
					{sdk?.i18n.locale}
				</div>
				<div class="info-item">
					<strong>{sdk?.i18n.t('permissions')}:</strong>
					{sdk?.context.permissions.join(', ')}
				</div>
			</div>
		</section>

		<!-- Counter Demo -->
		<section class="demo-section">
			<h2>{sdk?.i18n.t('counter_demo')}</h2>
			<div class="counter-display">
				<span class="heart-icon">
					<Heart size={32} />
				</span>
				<span class="counter-value">{counter}</span>
			</div>
			<button onclick={incrementCounter} class="btn btn-primary">
				{sdk?.i18n.t('increment')}
			</button>
			<button onclick={changeTitle} class="btn btn-secondary">
				{sdk?.i18n.t('update_title')}
			</button>
		</section>

		<!-- User Name Demo -->
		<section class="demo-section">
			<h2>{sdk?.i18n.t('data_storage_demo')}</h2>
			<div class="input-group">
				<input
					type="text"
					bind:value={userName}
					placeholder={sdk?.i18n.t('enter_name')}
					class="input"
				/>
				<button onclick={saveUserName} class="btn btn-primary">
					{sdk?.i18n.t('save')}
				</button>
			</div>
		</section>

		<!-- Saved Data Demo -->
		<section class="demo-section">
			<h2>{sdk?.i18n.t('query_demo')}</h2>
			<button onclick={loadSavedData} class="btn btn-primary">
				{sdk?.i18n.t('load_data')}
			</button>
			{#if savedData}
				<div class="data-display">
					<pre>{JSON.stringify(savedData, null, 2)}</pre>
				</div>
			{/if}
		</section>

		<!-- Remote Function Demo -->
		<section class="demo-section">
			<h2>{sdk?.i18n.t('remote_demo')}</h2>
			<button onclick={callRemoteFunction} class="btn btn-primary">
				{sdk?.i18n.t('call_remote')}
			</button>
			{#if remoteResult}
				<div class="data-display">
					<pre>{JSON.stringify(remoteResult, null, 2)}</pre>
				</div>
			{/if}
		</section>

		<!-- Notification Demo -->
		<section class="demo-section">
			<h2>{sdk?.i18n.t('notification_demo')}</h2>
			<button onclick={sendNotification} class="btn btn-primary">
				{sdk?.i18n.t('send_notification')}
			</button>
		</section>

		<!-- Actions -->
		<footer class="plugin-footer">
			<button onclick={closeWindow} class="btn btn-danger">
				{sdk?.i18n.t('close')}
			</button>
		</footer>
	</div>
{/if}

<style>
	.plugin-container {
		margin: 0 auto;
		padding: 2rem;
		max-width: 800px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.plugin-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 2rem;
		border-bottom: 2px solid #e5e7eb;
		padding-bottom: 1rem;
	}

	.plugin-icon-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 8px;
		width: 64px;
		height: 64px;
	}

	.plugin-header h1 {
		margin: 0;
		color: #1f2937;
		font-size: 2rem;
	}

	.subtitle {
		margin: 0.25rem 0 0 0;
		color: #6b7280;
	}

	.info-section {
		margin-bottom: 2rem;
		border-radius: 0.5rem;
		background: #f9fafb;
		padding: 1.5rem;
	}

	.info-section h2 {
		margin-top: 0;
		color: #374151;
		font-size: 1.25rem;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.info-item {
		color: #4b5563;
		font-size: 0.875rem;
	}

	.demo-section {
		margin-bottom: 2rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	.demo-section h2 {
		margin-top: 0;
		color: #374151;
		font-size: 1.125rem;
	}

	.counter-display {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin: 1.5rem 0;
		border-radius: 0.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 2rem;
		color: white;
	}

	.heart-icon {
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.counter-value {
		font-weight: bold;
		font-size: 3rem;
	}

	.input-group {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.input {
		flex: 1;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 1rem;
		font-size: 1rem;
	}

	.input:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
		border-color: #667eea;
	}

	.data-display {
		margin-top: 1rem;
		border-radius: 0.375rem;
		background: #1f2937;
		padding: 1rem;
		overflow-x: auto;
	}

	.data-display pre {
		margin: 0;
		color: #10b981;
		font-size: 0.875rem;
		font-family: 'Courier New', monospace;
	}

	.btn {
		transition: all 0.2s;
		cursor: pointer;
		border: none;
		border-radius: 0.375rem;
		padding: 0.5rem 1.5rem;
		font-weight: 500;
		font-size: 1rem;
	}

	.btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.btn:active {
		transform: translateY(0);
	}

	.btn-primary {
		margin-right: 0.5rem;
		background: #667eea;
		color: white;
	}

	.btn-primary:hover {
		background: #5568d3;
	}

	.btn-secondary {
		background: #6b7280;
		color: white;
	}

	.btn-secondary:hover {
		background: #4b5563;
	}

	.btn-danger {
		background: #ef4444;
		color: white;
	}

	.btn-danger:hover {
		background: #dc2626;
	}

	.plugin-footer {
		margin-top: 2rem;
		border-top: 2px solid #e5e7eb;
		padding-top: 1rem;
		text-align: center;
	}
</style>
