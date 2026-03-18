<script lang="ts">
	import Settings from './components/Settings.svelte';

	const sdk = window.webOS;

	let view = $state<'main' | 'settings'>('main');
	let serverTime = $state('');
	let loading = $state(false);

	async function getServerTime() {
		loading = true;
		try {
			const result = await sdk?.remote.call<{ time: string }>('getServerTime');
			serverTime = result?.time ?? 'N/A';
			sdk?.ui.toast('Server time loaded', 'success');
		} catch (error) {
			sdk?.ui.toast(`Error: ${(error as Error).message}`, 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="plugin-container">
	<nav>
		<button class:active={view === 'main'} onclick={() => (view = 'main')}>
			{sdk?.i18n.t('nav.main') ?? 'Main'}
		</button>
		<button class:active={view === 'settings'} onclick={() => (view = 'settings')}>
			{sdk?.i18n.t('nav.settings') ?? 'Settings'}
		</button>
	</nav>

	{#if view === 'main'}
		<h1>{sdk?.i18n.t('title') ?? 'Advanced Plugin'}</h1>
		<p>{sdk?.i18n.t('welcome') ?? 'Welcome!'}</p>

		<section>
			<h2>{sdk?.i18n.t('remote_demo') ?? 'Remote Function Demo'}</h2>
			<button onclick={getServerTime} disabled={loading}>
				{loading ? '...' : (sdk?.i18n.t('get_time') ?? 'Get Server Time')}
			</button>
			{#if serverTime}
				<p class="result">{serverTime}</p>
			{/if}
		</section>
	{:else}
		<Settings />
	{/if}
</div>

<style>
	.plugin-container {
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}

	nav {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid #e2e8f0;
		padding-bottom: 0.5rem;
	}

	nav button {
		cursor: pointer;
		border: none;
		border-radius: 0.25rem;
		background: none;
		padding: 0.5rem 1rem;
	}

	nav button.active {
		background: #f1f5f9;
		font-weight: 600;
	}

	section {
		margin-top: 1.5rem;
	}

	button:not(nav button) {
		cursor: pointer;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
	}

	.result {
		margin-top: 0.5rem;
		border-radius: 0.25rem;
		background: #f8fafc;
		padding: 0.5rem;
		font-family: monospace;
	}
</style>
