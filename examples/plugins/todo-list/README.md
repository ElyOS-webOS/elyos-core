# Todo List Plugin

A simple CRUD todo list plugin for Racona demonstrating DataService key-value storage operations.

## What It Demonstrates

- **DataService** — `sdk.data.set()` / `sdk.data.get()` for persisting todos
- **UIService** — toast notifications on add/remove/toggle actions
- **I18nService** — multi-language support (Hungarian, English)
- **ContextService** — plugin context and user info
- **Svelte 5 Runes** — `$state`, `$derived`, `$effect` for reactive state

## Features

- Add, remove, and toggle todos
- Filter by all / active / done
- Clear completed todos
- Persistent storage via SDK DataService
- Toast feedback on every action

## Project Structure

```
todo-list/
├── src/
│   ├── main.ts              # Entry point with MockWebOSSDK init
│   └── App.svelte           # Main todo list component
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

Todos are persisted to localStorage via MockWebOSSDK's MockDataService.

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
bun run build
# Output: dist/index.iife.js
```

## License

MIT
