# Hello World Plugin

A comprehensive example plugin for Racona demonstrating all SDK features and plugin development best practices.

## What It Demonstrates

- **UI Service** — toast messages, WebOS core components (DataTable, Input, Button)
- **Data Service** — key-value storage and SQL queries
- **Remote Service** — server-side function calls
- **I18n Service** — multi-language support (Hungarian, English)
- **Notification Service** — system notifications
- **Context Service** — plugin context (user, window, permissions)
- **Asset Service** — asset URL generation
- **AppLayout** — sidebar menu with dynamically loaded components
- **DataTable** — server-side pagination, sorting, faceted filters

## Project Structure

```
hello-world/
├── src/
│   ├── main.ts                  # Entry point with MockWebOSSDK init
│   ├── App.svelte               # Main component (layout placeholder)
│   └── components/
│       ├── Overview.svelte      # Overview page
│       ├── HelloWorldDemo.svelte # Full SDK demo
│       ├── DataTableDemo.svelte # DataTable with pagination/sorting
│       └── Settings.svelte      # Settings page
├── server/
│   └── functions.js             # Remote functions (getServerTime, etc.)
├── locales/
│   ├── en.json                  # English translations
│   └── hu.json                  # Hungarian translations
├── assets/
│   └── icon.svg                 # Plugin icon
├── menu.json                    # Sidebar menu definition
├── manifest.json                # Plugin metadata
├── package.json
├── vite.config.ts
├── build-all.js                 # Build script (main + components)
└── build-package.js             # Package script (.raconapkg)
```

## Development

### Standalone Mode (Mock SDK)

```bash
bun install
bun dev
```

The plugin initializes `MockWebOSSDK` automatically when `window.webOS` is not available, providing console-based feedback and localStorage-based storage.

### Racona Mode (Docker)

```bash
# Start Racona
docker compose up -d

# Start plugin dev server
bun dev

# In Racona: Plugin Manager → Load Dev Plugin → http://localhost:5173
```

## Build

```bash
# Build main plugin + all components
bun run build

# Create .raconapkg package for upload
bun run package
```

## SDK Usage

```typescript
// Access SDK instance
let sdk = $derived.by(() => {
	const instances = window.__webOS_instances;
	return instances?.get(pluginId) || window.webOS;
});

// Use services
sdk.ui.toast('Hello!', 'success');
await sdk.data.set('key', value);
const result = await sdk.remote.call('getServerTime', { format: 'ISO' });
const text = sdk.i18n.t('welcome');
```

## License

MIT
