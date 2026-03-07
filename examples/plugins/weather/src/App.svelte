<svelte:options customElement="weather-plugin" />

<script lang="ts">
	/**
	 * Weather Plugin
	 *
	 * Demonstrates RemoteService (sdk.remote.call) for API calls,
	 * DataService for saving favorites, and UIService for toast feedback.
	 */
	import { onMount } from 'svelte';
	import type {} from '@elyos/sdk/types';

	let { pluginId = 'weather' }: { pluginId?: string } = $props();

	interface WeatherData {
		city: string;
		temperature: number;
		condition: string;
		humidity: number;
		windSpeed: number;
		updatedAt: string;
	}

	interface CityResult {
		name: string;
		country: string;
	}

	let sdk = $derived.by(() => {
		const instances = (window as any).__webOS_instances;
		return instances?.get(pluginId) || window.webOS;
	});

	let translationsLoaded = $state(false);
	let searchQuery = $state('');
	let searchResults = $state<CityResult[]>([]);
	let currentWeather = $state<WeatherData | null>(null);
	let favorites = $state<string[]>([]);
	let loading = $state(false);
	let error = $state('');

	const isFavorite = $derived(currentWeather ? favorites.includes(currentWeather.city) : false);

	$effect(() => {
		if (sdk?.i18n) {
			sdk.i18n.ready().then(() => {
				translationsLoaded = true;
			});
		}
	});

	onMount(async () => {
		await sdk?.i18n?.ready();
		const saved = await sdk?.data?.get<string[]>('favorites');
		if (saved) {
			favorites = saved;
		}
		// Load weather for first favorite if available
		if (favorites.length > 0) {
			await loadWeather(favorites[0]);
		}
	});

	async function searchCities() {
		const query = searchQuery.trim();
		if (!query) {
			searchResults = [];
			return;
		}
		try {
			const result = await sdk?.remote?.call<{ success: boolean; cities: CityResult[] }>(
				'searchCities',
				{ query }
			);
			searchResults = result?.cities || [];
		} catch {
			searchResults = [];
		}
	}

	async function loadWeather(city: string) {
		loading = true;
		error = '';
		searchResults = [];
		searchQuery = '';
		try {
			const result = await sdk?.remote?.call<WeatherData & { success: boolean }>('getWeather', {
				city
			});
			if (result?.success === false) {
				error = sdk?.i18n?.t('error') || 'Error';
			} else if (result) {
				currentWeather = result;
			}
		} catch {
			error = sdk?.i18n?.t('error') || 'Error';
		} finally {
			loading = false;
		}
	}

	async function toggleFavorite() {
		if (!currentWeather) return;
		const city = currentWeather.city;

		if (favorites.includes(city)) {
			favorites = favorites.filter((f) => f !== city);
			sdk?.ui?.toast(sdk.i18n.t('favorite_removed'), 'info');
		} else {
			favorites = [...favorites, city];
			sdk?.ui?.toast(sdk.i18n.t('favorite_added'), 'success');
		}
		await sdk?.data?.set('favorites', favorites);
	}

	function conditionLabel(condition: string): string {
		return sdk?.i18n?.t(condition) || condition;
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') searchCities();
	}
</script>

{#if !translationsLoaded}
	<div class="loading">{sdk?.i18n?.t('loading') || 'Loading...'}</div>
{:else}
	<div class="weather-app">
		<h1>{sdk?.i18n.t('title')}</h1>

		<!-- Search -->
		<div class="search-row">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={sdk?.i18n.t('search_placeholder')}
				onkeydown={handleSearchKeydown}
				oninput={searchCities}
				class="search-input"
			/>
		</div>

		<!-- Search results dropdown -->
		{#if searchResults.length > 0}
			<ul class="search-results">
				{#each searchResults as city (city.name)}
					<li>
						<button class="result-btn" onclick={() => loadWeather(city.name)}>
							{city.name}
							<span class="country">{city.country}</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Current weather -->
		{#if loading}
			<div class="loading-card">{sdk?.i18n.t('loading')}</div>
		{:else if error}
			<div class="error-card">{error}</div>
		{:else if currentWeather}
			<div class="weather-card">
				<div class="weather-header">
					<h2>{currentWeather.city}</h2>
					<button
						class="fav-btn"
						class:is-fav={isFavorite}
						onclick={toggleFavorite}
						aria-label={isFavorite ? sdk?.i18n.t('remove_favorite') : sdk?.i18n.t('add_favorite')}
					>
						{isFavorite ? '★' : '☆'}
					</button>
				</div>
				<div class="weather-temp">{currentWeather.temperature}°C</div>
				<div class="weather-condition">{conditionLabel(currentWeather.condition)}</div>
				<div class="weather-details">
					<div class="detail">
						<span class="detail-label">{sdk?.i18n.t('humidity')}</span>
						<span class="detail-value">{currentWeather.humidity}%</span>
					</div>
					<div class="detail">
						<span class="detail-label">{sdk?.i18n.t('wind')}</span>
						<span class="detail-value">{currentWeather.windSpeed} km/h</span>
					</div>
				</div>
				<div class="weather-updated">
					{sdk?.i18n.t('updated_at')}: {new Date(currentWeather.updatedAt).toLocaleTimeString()}
				</div>
			</div>
		{/if}

		<!-- Favorites -->
		<div class="favorites-section">
			<h3>{sdk?.i18n.t('favorites')}</h3>
			{#if favorites.length === 0}
				<p class="no-favorites">{sdk?.i18n.t('no_favorites')}</p>
			{:else}
				<div class="favorites-list">
					{#each favorites as city (city)}
						<button
							class="fav-chip"
							class:active={currentWeather?.city === city}
							onclick={() => loadWeather(city)}
						>
							{city}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #6b7280;
	}

	.weather-app {
		margin: 0 auto;
		padding: 1.5rem;
		max-width: 600px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h1 {
		margin: 0 0 1.25rem;
		color: #1f2937;
		font-size: 1.5rem;
	}

	.search-row {
		position: relative;
		margin-bottom: 0.5rem;
	}

	.search-input {
		box-sizing: border-box;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		width: 100%;
		font-size: 0.95rem;
	}

	.search-input:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
		border-color: #3b82f6;
	}

	.search-results {
		margin: 0 0 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		padding: 0;
		list-style: none;
	}

	.result-btn {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0.5rem 0.75rem;
		width: 100%;
		font-size: 0.9rem;
		text-align: left;
	}

	.result-btn:hover {
		background: #f3f4f6;
	}

	.country {
		color: #9ca3af;
		font-size: 0.8rem;
	}

	.loading-card,
	.error-card {
		border-radius: 0.5rem;
		padding: 2rem;
		text-align: center;
	}

	.loading-card {
		background: #f9fafb;
		color: #6b7280;
	}

	.error-card {
		background: #fef2f2;
		color: #dc2626;
	}

	.weather-card {
		margin-bottom: 1.5rem;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		padding: 1.5rem;
		color: white;
	}

	.weather-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.weather-header h2 {
		margin: 0;
		font-size: 1.25rem;
	}

	.fav-btn {
		opacity: 0.7;
		cursor: pointer;
		border: none;
		background: none;
		color: white;
		font-size: 1.5rem;
	}

	.fav-btn:hover,
	.fav-btn.is-fav {
		opacity: 1;
	}

	.weather-temp {
		margin: 0.5rem 0;
		font-weight: 700;
		font-size: 3rem;
	}

	.weather-condition {
		opacity: 0.9;
		margin-bottom: 1rem;
		font-size: 1.1rem;
	}

	.weather-details {
		display: flex;
		gap: 2rem;
		margin-bottom: 0.75rem;
	}

	.detail {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.detail-label {
		opacity: 0.7;
		font-size: 0.75rem;
		text-transform: uppercase;
	}

	.detail-value {
		font-weight: 600;
		font-size: 1rem;
	}

	.weather-updated {
		opacity: 0.6;
		font-size: 0.75rem;
	}

	.favorites-section {
		margin-top: 1rem;
	}

	.favorites-section h3 {
		margin: 0 0 0.75rem;
		color: #374151;
		font-size: 1rem;
	}

	.no-favorites {
		color: #9ca3af;
		font-size: 0.85rem;
	}

	.favorites-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.fav-chip {
		transition: all 0.15s;
		cursor: pointer;
		border: 1px solid #d1d5db;
		border-radius: 2rem;
		background: white;
		padding: 0.35rem 0.85rem;
		color: #374151;
		font-size: 0.85rem;
	}

	.fav-chip:hover {
		border-color: #3b82f6;
		color: #3b82f6;
	}

	.fav-chip.active {
		border-color: #3b82f6;
		background: #3b82f6;
		color: white;
	}
</style>
