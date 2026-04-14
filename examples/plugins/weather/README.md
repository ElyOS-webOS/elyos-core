# Weather Plugin

A weather plugin for Racona demonstrating RemoteService API integration and DataService for favorites.

## What It Demonstrates

- **RemoteService** — `sdk.remote.call('getWeather', { city })` and `sdk.remote.call('searchCities', { query })` for API calls
- **DataService** — `sdk.data.set()` / `sdk.data.get()` for persisting favorite cities
- **UIService** — toast notifications on favorite add/remove
- **I18nService** — multi-language support (Hungarian, English)
- **MockWebOSSDK** — custom remote handlers for standalone development

## Features

- City search with instant results
- Weather display (temperature, condition, humidity, wind)
- Favorite cities with quick access
- Mock weather data in dev mode via MockWebOSSDK handlers

## Project Structure

```
weather/
├── src/
│   ├── main.ts              # Entry point with MockWebOSSDK + mock handlers
│   └── App.svelte           # Main weather component
├── locales/
│   ├── en.json              # English translations
│   └── hu.json              # Hungarian translations
├── assets/
│   └── icon.svg             # Plugin icon
├── manifest.json            # Plugin metadata
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Development

### Standalone Mode (Mock SDK)

```bash
bun install
bun dev
```

The MockWebOSSDK is initialized with custom remote handlers that return mock weather data for 8 cities. Favorites are persisted to localStorage.

### Racona Mode (Docker)

```bash
# Start Racona
docker compose up -d

# Start plugin dev server
bun dev

# In Racona: Plugin Manager → Load Dev Plugin → http://localhost:5173
```

In Racona mode, `sdk.remote.call('getWeather', ...)` calls the actual server-side function defined in `server/functions.ts` (not included in this example — you'd add it for production use).

## Build

```bash
bun run build
# Output: dist/index.iife.js
```

## License

MIT
