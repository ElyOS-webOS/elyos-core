<script lang="ts">
	import {
		MapLibre,
		NavigationControl,
		ScaleControl,
		GeolocateControl,
		Marker,
		Popup,
		GeoJSONSource,
		LineLayer
	} from 'svelte-maplibre-gl';
	import { I18nProvider } from '$lib/i18n/components';
	import { useI18n } from '$lib/i18n/hooks';

	type LngLatLike = { lng: number; lat: number };
	type TravelMode = 'auto' | 'pedestrian' | 'bicycle';
	type Tab = 'search' | 'route';

	interface SearchResult {
		display_name: string;
		lat: string;
		lon: string;
	}

	const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

	const { t } = useI18n();

	// Aktív fül
	let activeTab = $state<Tab>('search');

	// --- Keresés állapot ---
	let searchInput = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let searchMarker = $state<LngLatLike | null>(null);
	let searchLabel = $state('');
	let isSearching = $state(false);
	let searchError = $state('');

	// --- Útvonal állapot ---
	let startInput = $state('');
	let endInput = $state('');
	let startCoord = $state<LngLatLike | null>(null);
	let endCoord = $state<LngLatLike | null>(null);
	let routeGeoJSON = $state<GeoJSON.FeatureCollection | null>(null);
	let routeInfo = $state<{ distance: string; duration: string } | null>(null);
	let isRouting = $state(false);
	let isLocating = $state(false);
	let routeError = $state('');
	let showOptions = $state(false);
	let routeMode = $state<TravelMode>('auto');
	let avoidTolls = $state(false);
	let avoidHighways = $state(false);
	let avoidFerries = $state(false);

	// Térkép állapot
	let mapCenter = $state<LngLatLike>({ lng: 19.04, lat: 47.5 });
	let mapZoom = $state(7);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let map = $state<any>();

	let nonAutoDisabled = $derived(routeMode !== 'auto');

	// --- Keresés ---
	async function search() {
		if (!searchInput.trim()) return;
		isSearching = true;
		searchError = '';
		searchResults = [];
		try {
			const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json&limit=5&addressdetails=1`;
			const res = await fetch(url, { headers: { 'Accept-Language': 'hu' } });
			const data: SearchResult[] = await res.json();
			if (data.length === 0) {
				searchError = t('map.search.notFound');
			} else {
				searchResults = data;
			}
		} catch {
			searchError = t('map.search.error');
		} finally {
			isSearching = false;
		}
	}

	function selectSearchResult(result: SearchResult) {
		searchMarker = { lng: parseFloat(result.lon), lat: parseFloat(result.lat) };
		searchLabel = result.display_name;
		mapCenter = { lng: parseFloat(result.lon), lat: parseFloat(result.lat) };
		mapZoom = 14;
		searchResults = [];
	}

	function clearSearch() {
		searchInput = '';
		searchResults = [];
		searchMarker = null;
		searchLabel = '';
		searchError = '';
	}

	// --- Geocoding ---
	async function geocode(query: string): Promise<LngLatLike | null> {
		const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
		const res = await fetch(url, { headers: { 'Accept-Language': 'hu' } });
		const data = await res.json();
		if (data.length === 0) return null;
		return { lng: parseFloat(data[0].lon), lat: parseFloat(data[0].lat) };
	}

	async function reverseGeocode(lng: number, lat: number): Promise<string> {
		const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
		const res = await fetch(url, { headers: { 'Accept-Language': 'hu' } });
		const data = await res.json();
		return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
	}

	// --- Aktuális hely ---
	async function useCurrentLocation() {
		if (!navigator.geolocation) {
			routeError = t('map.locate.notSupported');
			return;
		}
		isLocating = true;
		routeError = '';
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const { longitude, latitude } = pos.coords;
				startCoord = { lng: longitude, lat: latitude };
				try {
					startInput = await reverseGeocode(longitude, latitude);
				} catch {
					startInput = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
				}
				mapCenter = { lng: longitude, lat: latitude };
				mapZoom = 13;
				isLocating = false;
			},
			() => {
				routeError = t('map.locate.error');
				isLocating = false;
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	// --- Valhalla polyline dekóder ---
	function decodePolyline(encoded: string): [number, number][] {
		const coords: [number, number][] = [];
		let index = 0,
			lat = 0,
			lng = 0;
		while (index < encoded.length) {
			let shift = 0,
				result = 0,
				b: number;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			lat += result & 1 ? ~(result >> 1) : result >> 1;
			shift = 0;
			result = 0;
			do {
				b = encoded.charCodeAt(index++) - 63;
				result |= (b & 0x1f) << shift;
				shift += 5;
			} while (b >= 0x20);
			lng += result & 1 ? ~(result >> 1) : result >> 1;
			coords.push([lng / 1e6, lat / 1e6]);
		}
		return coords;
	}

	// --- Útvonal tervezés ---
	async function fetchRoute(start: LngLatLike, end: LngLatLike): Promise<void> {
		const body: Record<string, unknown> = {
			locations: [
				{ lon: start.lng, lat: start.lat },
				{ lon: end.lng, lat: end.lat }
			],
			costing: routeMode,
			directions_options: { language: 'hu-HU' }
		};

		// Csak akkor küldjük a costing_options-t ha van beállítva valami
		if (routeMode === 'auto' && (avoidTolls || avoidHighways || avoidFerries)) {
			body.costing_options = {
				auto: {
					...(avoidTolls && { use_tolls: 0 }),
					...(avoidHighways && { use_highways: 0 }),
					...(avoidFerries && { use_ferry: 0 })
				}
			};
		} else if (routeMode === 'bicycle' && avoidFerries) {
			body.costing_options = { bicycle: { use_ferry: 0 } };
		}

		const res = await fetch('https://valhalla1.openstreetmap.de/route', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		if (!res.ok) {
			const err = await res.json().catch(() => ({}));
			const msg = (err as { error?: string })?.error;
			routeError = msg ?? t('map.route.serverError', { status: String(res.status) });
			return;
		}

		let data: Record<string, unknown>;
		try {
			data = await res.json();
		} catch {
			routeError = t('map.route.invalidResponse');
			return;
		}

		const trip = data.trip as Record<string, unknown> | undefined;
		const legs = trip?.legs as Array<Record<string, unknown>> | undefined;
		const leg = legs?.[0];
		if (!leg?.shape) {
			routeError = t('map.route.notFound');
			return;
		}

		routeGeoJSON = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: {},
					geometry: { type: 'LineString', coordinates: decodePolyline(leg.shape as string) }
				}
			]
		};

		const summary = (trip as Record<string, unknown>).summary as Record<string, number>;
		const km = summary.length.toFixed(1);
		const totalMin = Math.round(summary.time / 60);
		const h = Math.floor(totalMin / 60);
		const m = totalMin % 60;
		routeInfo = { distance: `${km} km`, duration: h > 0 ? `${h} ó ${m} perc` : `${m} perc` };
	}

	async function planRoute() {
		if (!startInput.trim() || !endInput.trim()) {
			routeError = 'Kérlek add meg az indulási és érkezési helyet.';
			return;
		}
		isRouting = true;
		routeError = '';
		routeGeoJSON = null;
		routeInfo = null;
		try {
			const [s, e] = await Promise.all([
				startCoord ? Promise.resolve(startCoord) : geocode(startInput),
				geocode(endInput)
			]);
			if (!s) {
				routeError = t('map.route.geocodeError', { place: startInput });
				return;
			}
			if (!e) {
				routeError = t('map.route.geocodeError', { place: endInput });
				return;
			}
			startCoord = s;
			endCoord = e;
			await fetchRoute(s, e);
			// fitBounds: az útvonal bounding box-ára zoomolunk padding-gel
			if (map) {
				map.fitBounds(
					[
						[Math.min(s.lng, e.lng), Math.min(s.lat, e.lat)],
						[Math.max(s.lng, e.lng), Math.max(s.lat, e.lat)]
					],
					{ padding: 80, maxZoom: 16, duration: 800 }
				);
			} else {
				mapCenter = { lng: (s.lng + e.lng) / 2, lat: (s.lat + e.lat) / 2 };
				mapZoom = 8;
			}
		} catch {
			routeError = t('map.route.error');
		} finally {
			isRouting = false;
		}
	}

	function clearRoute() {
		startInput = '';
		endInput = '';
		startCoord = null;
		endCoord = null;
		routeGeoJSON = null;
		routeInfo = null;
		routeError = '';
	}

	// Fülváltáskor töröljük a másik fül állapotát
	function switchTab(tab: Tab) {
		if (tab === 'search') {
			// Útvonal törlése
			startInput = '';
			endInput = '';
			startCoord = null;
			endCoord = null;
			routeGeoJSON = null;
			routeInfo = null;
			routeError = '';
		} else {
			// Keresés törlése
			searchInput = '';
			searchResults = [];
			searchMarker = null;
			searchLabel = '';
			searchError = '';
		}
		activeTab = tab;
	}
</script>

<I18nProvider namespaces={['map']}>
	<div class="map-app">
		<div class="sidebar">
			<!-- Fülek -->
			<div class="tabs">
				<button
					class="tab"
					class:active={activeTab === 'search'}
					onclick={() => switchTab('search')}
				>
					{t('map.tabs.search')}
				</button>
				<button class="tab" class:active={activeTab === 'route'} onclick={() => switchTab('route')}>
					{t('map.tabs.route')}
				</button>
			</div>

			<!-- KERESÉS FÜL -->
			{#if activeTab === 'search'}
				<div class="tab-content">
					<div class="form-group">
						<label for="search-input">{t('map.search.label')}</label>
						<div class="input-row">
							<input
								id="search-input"
								type="text"
								bind:value={searchInput}
								placeholder={t('map.search.placeholder')}
								onkeydown={(e) => e.key === 'Enter' && search()}
							/>
							<button
								class="btn-icon"
								onclick={search}
								disabled={isSearching}
								aria-label={t('map.search.button')}
							>
								{#if isSearching}
									<span class="spinner"></span>
								{:else}
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg
									>
								{/if}
							</button>
						</div>
					</div>

					{#if searchError}
						<div class="error-msg">{searchError}</div>
					{/if}

					{#if searchResults.length > 0}
						<ul class="results-list">
							{#each searchResults as result}
								<li>
									<button class="result-item" onclick={() => selectSearchResult(result)}>
										{result.display_name}
									</button>
								</li>
							{/each}
						</ul>
					{/if}

					{#if searchMarker}
						<div class="search-result-info">
							<p class="result-name">{searchLabel}</p>
							<button class="btn-link" onclick={clearSearch}>{t('map.search.clear')}</button>
						</div>
					{/if}
				</div>
			{/if}

			<!-- ÚTVONAL FÜL -->
			{#if activeTab === 'route'}
				<div class="tab-content">
					<div class="form-group">
						<label for="start-input">{t('map.route.startLabel')}</label>
						<div class="input-row">
							<input
								id="start-input"
								type="text"
								bind:value={startInput}
								placeholder={t('map.route.startPlaceholder')}
								oninput={() => (startCoord = null)}
								onkeydown={(e) => e.key === 'Enter' && planRoute()}
							/>
							<button
								class="btn-icon"
								onclick={useCurrentLocation}
								disabled={isLocating}
								title={t('map.locate.button')}
								aria-label={t('map.locate.button')}
							>
								{#if isLocating}
									<span class="spinner"></span>
								{:else}
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										><circle cx="12" cy="12" r="3" /><path
											d="M12 2v3M12 19v3M2 12h3M19 12h3"
										/><circle cx="12" cy="12" r="9" stroke-dasharray="2 4" /></svg
									>
								{/if}
							</button>
						</div>
					</div>

					<div class="form-group">
						<label for="end-input">{t('map.route.endLabel')}</label>
						<input
							id="end-input"
							type="text"
							bind:value={endInput}
							placeholder={t('map.route.endPlaceholder')}
							onkeydown={(e) => e.key === 'Enter' && planRoute()}
						/>
					</div>

					<div class="form-group">
						<label for="mode-select">{t('map.route.modeLabel')}</label>
						<select id="mode-select" bind:value={routeMode} onchange={() => (startCoord = null)}>
							<option value="auto">{t('map.route.modeAuto')}</option>
							<option value="pedestrian">{t('map.route.modePedestrian')}</option>
							<option value="bicycle">{t('map.route.modeBicycle')}</option>
						</select>
					</div>

					<div class="options-section">
						<button class="options-toggle" onclick={() => (showOptions = !showOptions)}>
							<span>{t('map.route.settings')}</span>
							<span class="chevron" class:open={showOptions}>▾</span>
						</button>
						{#if showOptions}
							<div class="options-panel">
								<label class="option-row" class:disabled={nonAutoDisabled}>
									<input type="checkbox" bind:checked={avoidTolls} disabled={nonAutoDisabled} />
									<span>{t('map.route.avoidTolls')}</span>
								</label>
								<label class="option-row" class:disabled={nonAutoDisabled}>
									<input type="checkbox" bind:checked={avoidHighways} disabled={nonAutoDisabled} />
									<span>{t('map.route.avoidHighways')}</span>
								</label>
								<label class="option-row">
									<input type="checkbox" bind:checked={avoidFerries} />
									<span>{t('map.route.avoidFerries')}</span>
								</label>
							</div>
						{/if}
					</div>

					<div class="button-row">
						<button class="btn-primary" onclick={planRoute} disabled={isRouting}>
							{isRouting ? t('map.route.planning') : t('map.route.planButton')}
						</button>
						{#if routeGeoJSON || startCoord}
							<button class="btn-secondary" onclick={clearRoute}>{t('map.route.clear')}</button>
						{/if}
					</div>

					{#if routeError}
						<div class="error-msg">{routeError}</div>
					{/if}

					{#if routeInfo}
						<div class="route-info">
							<div class="route-info-row">
								<span class="route-label">{t('map.route.distance')}</span>
								<span class="route-value">{routeInfo.distance}</span>
							</div>
							<div class="route-info-row">
								<span class="route-label">{t('map.route.duration')}</span>
								<span class="route-value">{routeInfo.duration}</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Térkép -->
		<div class="map-container">
			<MapLibre style={MAP_STYLE} center={mapCenter} zoom={mapZoom} bind:map class="map">
				<NavigationControl position="top-right" />
				<ScaleControl position="bottom-right" />
				<GeolocateControl position="top-right" positionOptions={{ enableHighAccuracy: true }} />

				{#if routeGeoJSON}
					<GeoJSONSource id="route" data={routeGeoJSON}>
						<LineLayer
							id="route-line"
							layout={{ 'line-join': 'round', 'line-cap': 'round' }}
							paint={{ 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.85 }}
						/>
					</GeoJSONSource>
				{/if}

				{#if activeTab === 'search' && searchMarker}
					<Marker lnglat={searchMarker}>
						{#snippet content()}
							<div class="marker marker-search"><span>●</span></div>
						{/snippet}
						<Popup><span class="popup-text">{searchLabel}</span></Popup>
					</Marker>
				{/if}

				{#if activeTab === 'route'}
					{#if startCoord}
						<Marker lnglat={startCoord}>
							{#snippet content()}
								<div class="marker marker-start"><span>A</span></div>
							{/snippet}
							<Popup><span class="popup-text">{t('map.depart')}: {startInput}</span></Popup>
						</Marker>
					{/if}
					{#if endCoord}
						<Marker lnglat={endCoord}>
							{#snippet content()}
								<div class="marker marker-end"><span>B</span></div>
							{/snippet}
							<Popup><span class="popup-text">{t('map.arrive')}: {endInput}</span></Popup>
						</Marker>
					{/if}
				{/if}
			</MapLibre>
		</div>
	</div>
</I18nProvider>

<style>
	.map-app {
		display: flex;
		border-radius: var(--radius-md, 8px);
		height: 100%;
		overflow: hidden;
	}

	/* Oldalsáv */
	.sidebar {
		display: flex;
		flex-shrink: 0;
		flex-direction: column;
		border-right: 1px solid var(--color-neutral-200);
		background: var(--color-neutral-50);
		width: 260px;
		overflow: hidden;
	}

	:global(.dark) .sidebar {
		border-right-color: var(--color-neutral-700);
		background: var(--color-neutral-900);
	}

	/* Fülek */
	.tabs {
		display: flex;
		flex-shrink: 0;
		border-bottom: 1px solid var(--color-neutral-200);
	}

	:global(.dark) .tabs {
		border-bottom-color: var(--color-neutral-700);
	}

	.tab {
		flex: 1;
		transition:
			color 0.15s,
			border-color 0.15s;
		cursor: pointer;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		padding: 0.6rem 0;
		color: var(--color-neutral-500);
		font-weight: 500;
		font-size: 0.8rem;
	}

	.tab:hover {
		color: var(--color-neutral-700);
	}

	.tab.active {
		border-bottom-color: #3b82f6;
		color: #3b82f6;
	}

	:global(.dark) .tab {
		color: var(--color-neutral-500);
	}

	:global(.dark) .tab:hover {
		color: var(--color-neutral-300);
	}

	:global(.dark) .tab.active {
		border-bottom-color: #60a5fa;
		color: #60a5fa;
	}

	/* Fül tartalom */
	.tab-content {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		overflow-y: auto;
	}

	/* Form elemek */
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group label {
		color: var(--color-neutral-600);
		font-weight: 500;
		font-size: 0.75rem;
	}

	:global(.dark) .form-group label {
		color: var(--color-neutral-400);
	}

	.form-group input[type='text'],
	.form-group select {
		transition: border-color 0.15s;
		outline: none;
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--radius-sm, 6px);
		background: white;
		padding: 0.4rem 0.6rem;
		width: 100%;
		color: var(--color-neutral-800);
		font-size: 0.8rem;
	}

	.form-group input[type='text']:focus,
	.form-group select:focus {
		border-color: #3b82f6;
	}

	:global(.dark) .form-group input[type='text'],
	:global(.dark) .form-group select {
		border-color: var(--color-neutral-600);
		background: var(--color-neutral-800);
		color: var(--color-neutral-100);
	}

	.input-row {
		display: flex;
		gap: 0.35rem;
	}

	.input-row input {
		flex: 1;
		min-width: 0;
	}

	/* Ikon gomb */
	.btn-icon {
		display: flex;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		transition: background 0.15s;
		cursor: pointer;
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--radius-sm, 6px);
		background: white;
		width: 32px;
		height: 32px;
		color: var(--color-neutral-500);
	}

	.btn-icon:hover:not(:disabled) {
		border-color: #3b82f6;
		background: #eff6ff;
		color: #3b82f6;
	}

	.btn-icon:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	:global(.dark) .btn-icon {
		border-color: var(--color-neutral-600);
		background: var(--color-neutral-800);
		color: var(--color-neutral-400);
	}

	:global(.dark) .btn-icon:hover:not(:disabled) {
		border-color: #3b82f6;
		background: #1e3a5f;
		color: #60a5fa;
	}

	/* Keresési találatok */
	.results-list {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.result-item {
		display: block;
		transition:
			background 0.1s,
			border-color 0.1s;
		cursor: pointer;
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--radius-sm, 6px);
		background: white;
		padding: 0.4rem 0.6rem;
		width: 100%;
		color: var(--color-neutral-700);
		font-size: 0.75rem;
		line-height: 1.4;
		text-align: left;
	}

	.result-item:hover {
		border-color: #3b82f6;
		background: #eff6ff;
		color: #1d4ed8;
	}

	:global(.dark) .result-item {
		border-color: var(--color-neutral-700);
		background: var(--color-neutral-800);
		color: var(--color-neutral-300);
	}

	:global(.dark) .result-item:hover {
		border-color: #3b82f6;
		background: #1e3a5f;
		color: #93c5fd;
	}

	.search-result-info {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
		border-radius: var(--radius-sm, 6px);
		background: #eff6ff;
		padding: 0.5rem 0.6rem;
	}

	:global(.dark) .search-result-info {
		background: #1e3a5f;
	}

	.result-name {
		flex: 1;
		margin: 0;
		color: var(--color-neutral-700);
		font-size: 0.75rem;
		line-height: 1.4;
	}

	:global(.dark) .result-name {
		color: var(--color-neutral-300);
	}

	.btn-link {
		flex-shrink: 0;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0;
		color: #3b82f6;
		font-size: 0.75rem;
		text-decoration: underline;
	}

	/* Beállítások */
	.options-section {
		display: flex;
		flex-direction: column;
	}

	.options-toggle {
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: background 0.15s;
		cursor: pointer;
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--radius-sm, 6px);
		background: transparent;
		padding: 0.35rem 0.6rem;
		color: var(--color-neutral-600);
		font-size: 0.78rem;
	}

	.options-toggle:hover {
		background: var(--color-neutral-100);
	}

	:global(.dark) .options-toggle {
		border-color: var(--color-neutral-600);
		color: var(--color-neutral-400);
	}

	:global(.dark) .options-toggle:hover {
		background: var(--color-neutral-800);
	}

	.chevron {
		display: inline-block;
		transition: transform 0.2s;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.options-panel {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border: 1px solid var(--color-neutral-200);
		border-top: none;
		border-radius: 0 0 var(--radius-sm, 6px) var(--radius-sm, 6px);
		background: var(--color-neutral-100);
		padding: 0.6rem 0.75rem;
	}

	:global(.dark) .options-panel {
		border-color: var(--color-neutral-700);
		background: var(--color-neutral-800);
	}

	.option-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		color: var(--color-neutral-700);
		font-size: 0.78rem;
	}

	.option-row.disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	:global(.dark) .option-row {
		color: var(--color-neutral-300);
	}

	.option-row input[type='checkbox'] {
		cursor: pointer;
		width: 14px;
		height: 14px;
		accent-color: #3b82f6;
	}

	.option-row.disabled input[type='checkbox'] {
		cursor: not-allowed;
	}

	/* Gombok */
	.button-row {
		display: flex;
		gap: 0.5rem;
	}

	.btn-primary {
		flex: 1;
		transition: background 0.15s;
		cursor: pointer;
		border: none;
		border-radius: var(--radius-sm, 6px);
		background: #3b82f6;
		padding: 0.45rem 0.75rem;
		color: white;
		font-weight: 500;
		font-size: 0.8rem;
	}

	.btn-primary:hover:not(:disabled) {
		background: #2563eb;
	}
	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		transition: background 0.15s;
		cursor: pointer;
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--radius-sm, 6px);
		background: transparent;
		padding: 0.45rem 0.75rem;
		color: var(--color-neutral-600);
		font-size: 0.8rem;
	}

	.btn-secondary:hover {
		background: var(--color-neutral-100);
	}

	:global(.dark) .btn-secondary {
		border-color: var(--color-neutral-600);
		color: var(--color-neutral-300);
	}

	:global(.dark) .btn-secondary:hover {
		background: var(--color-neutral-800);
	}

	/* Hibaüzenet */
	.error-msg {
		border-radius: var(--radius-sm, 6px);
		background: #fee2e2;
		padding: 0.5rem 0.6rem;
		color: #dc2626;
		font-size: 0.75rem;
	}

	:global(.dark) .error-msg {
		background: #450a0a;
		color: #fca5a5;
	}

	/* Útvonal info */
	.route-info {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		border-radius: var(--radius-sm, 6px);
		background: #eff6ff;
		padding: 0.6rem 0.75rem;
	}

	:global(.dark) .route-info {
		background: #1e3a5f;
	}

	.route-info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.route-label {
		color: var(--color-neutral-500);
		font-size: 0.75rem;
	}

	.route-value {
		color: #1d4ed8;
		font-weight: 600;
		font-size: 0.8rem;
	}

	:global(.dark) .route-value {
		color: #93c5fd;
	}

	/* Spinner */
	.spinner {
		display: inline-block;
		animation: spin 0.8s linear infinite;
		border: 2px solid var(--color-neutral-300);
		border-top-color: #3b82f6;
		border-radius: 50%;
		width: 14px;
		height: 14px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Térkép */
	.map-container {
		position: relative;
		flex: 1;
		overflow: hidden;
	}

	:global(.map-container .map) {
		width: 100%;
		height: 100%;
	}

	/* Markerek */
	.marker {
		display: flex;
		justify-content: center;
		align-items: center;
		transform: rotate(-45deg);
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		border: 2px solid white;
		border-radius: 50% 50% 50% 0;
		width: 28px;
		height: 28px;
		color: white;
		font-weight: 700;
		font-size: 0.75rem;
	}

	.marker span {
		transform: rotate(45deg);
	}

	.marker-search {
		background: #8b5cf6;
	}
	.marker-start {
		background: #22c55e;
	}
	.marker-end {
		background: #ef4444;
	}

	.popup-text {
		color: #1f2937;
		font-size: 0.8rem;
	}
</style>
