/**
 * Weather Plugin — Entry point
 *
 * Demonstrates RemoteService (sdk.remote.call) for API calls,
 * DataService for saving favorites, and MockWebOSSDK with custom handlers.
 */
import { MockWebOSSDK } from '@elyos/sdk/dev';
import App from './App.svelte';

// Mock weather data for standalone development
const mockCities: Record<
	string,
	{ temp: number; condition: string; humidity: number; wind: number }
> = {
	Budapest: { temp: 22, condition: 'sunny', humidity: 45, wind: 12 },
	London: { temp: 15, condition: 'cloudy', humidity: 78, wind: 20 },
	'New York': { temp: 28, condition: 'partly_cloudy', humidity: 55, wind: 8 },
	Tokyo: { temp: 30, condition: 'rainy', humidity: 85, wind: 5 },
	Sydney: { temp: 18, condition: 'sunny', humidity: 40, wind: 15 },
	Berlin: { temp: 19, condition: 'cloudy', humidity: 65, wind: 18 },
	Paris: { temp: 21, condition: 'partly_cloudy', humidity: 50, wind: 10 },
	Rome: { temp: 26, condition: 'sunny', humidity: 35, wind: 7 }
};

// Initialize Mock SDK for standalone development
if (typeof window !== 'undefined' && !window.webOS) {
	MockWebOSSDK.initialize({
		remote: {
			handlers: {
				getWeather: (params: any) => {
					const city = params?.city as string;
					const data = mockCities[city];
					if (!data) {
						return { success: false, error: `City "${city}" not found` };
					}
					return {
						success: true,
						city,
						temperature: data.temp + Math.round((Math.random() - 0.5) * 4),
						condition: data.condition,
						humidity: data.humidity,
						windSpeed: data.wind,
						updatedAt: new Date().toISOString()
					};
				},
				searchCities: (params: any) => {
					const query = ((params?.query as string) || '').toLowerCase();
					const results = Object.keys(mockCities)
						.filter((c) => c.toLowerCase().includes(query))
						.map((name) => ({ name, country: 'Mock' }));
					return { success: true, cities: results };
				}
			}
		},
		i18n: {
			locale: 'en',
			translations: {
				en: {
					title: 'Weather',
					search_placeholder: 'Search city...',
					search_button: 'Search',
					no_results: 'No cities found',
					temperature: 'Temperature',
					humidity: 'Humidity',
					wind: 'Wind',
					condition: 'Condition',
					favorites: 'Favorites',
					add_favorite: 'Add to favorites',
					remove_favorite: 'Remove from favorites',
					no_favorites: 'No favorite cities yet',
					updated_at: 'Updated',
					loading: 'Loading...',
					error: 'Failed to load weather data',
					favorite_added: 'Added to favorites',
					favorite_removed: 'Removed from favorites',
					sunny: 'Sunny ☀️',
					cloudy: 'Cloudy ☁️',
					rainy: 'Rainy 🌧️',
					partly_cloudy: 'Partly Cloudy ⛅',
					snowy: 'Snowy ❄️'
				},
				hu: {
					title: 'Időjárás',
					search_placeholder: 'Város keresése...',
					search_button: 'Keresés',
					no_results: 'Nem található város',
					temperature: 'Hőmérséklet',
					humidity: 'Páratartalom',
					wind: 'Szél',
					condition: 'Időjárás',
					favorites: 'Kedvencek',
					add_favorite: 'Hozzáadás a kedvencekhez',
					remove_favorite: 'Eltávolítás a kedvencekből',
					no_favorites: 'Nincs még kedvenc város',
					updated_at: 'Frissítve',
					loading: 'Betöltés...',
					error: 'Nem sikerült betölteni az időjárás adatokat',
					favorite_added: 'Hozzáadva a kedvencekhez',
					favorite_removed: 'Eltávolítva a kedvencekből',
					sunny: 'Napos ☀️',
					cloudy: 'Felhős ☁️',
					rainy: 'Esős 🌧️',
					partly_cloudy: 'Részben felhős ⛅',
					snowy: 'Havas ❄️'
				}
			}
		},
		context: {
			pluginId: 'weather',
			user: { id: 'dev-user', name: 'Developer', email: 'dev@localhost', roles: [], groups: [] },
			permissions: ['database', 'remote_functions']
		}
	});
}

export default function createPlugin() {
	return {
		tagName: 'weather-plugin',
		component: App
	};
}

if (typeof window !== 'undefined') {
	(window as any).weather_Plugin = createPlugin;
}
