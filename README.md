<p align="center">
  <img src="https://elyos.hu/logo.png" alt="ElyOS Logo" width="120" />
</p>

<!-- <h1 align="center">ElyOS</h1> -->

<p align="center">
  A modern, web-based operating system delivering a full desktop experience in the browser.
</p>

<p align="center">
  <!-- <a href="https://www.npmjs.com/package/@elyos/sdk"><img src="https://img.shields.io/npm/v/@elyos/sdk?label=%40elyos%2Fsdk&color=blue" alt="npm version" /></a>
  <a href="https://hub.docker.com/r/elyos/core"><img src="https://img.shields.io/docker/pulls/elyos/core" alt="Docker pulls" /></a>
  <a href="https://github.com/elyos/core/actions"><img src="https://img.shields.io/github/actions/workflow/status/elyos/core/ci.yml?branch=main&label=CI" alt="CI status" /></a>-->
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>
</p>

<p align="center">
  <a href="https://elyos.hu">Website</a> · <a href="https://docs.elyos.hu/en/">Documentation (user)</a> ·<!-- <a href="./docs/PLUGIN_DEVELOPMENT.md">Plugin Development</a> ·--> <a href="./docs/CONTRIBUTING.md">Contributing</a>
</p>

---

<!-- Screenshot placeholder -->
<!-- <p align="center"><img src="https://elyos.hu/screenshots/desktop.png" alt="ElyOS Desktop" width="800" /></p> -->

> **Note:** The ElyOS codebase uses Hungarian for internal comments, variable names, and UI strings. All public-facing documentation is in English.

## What is ElyOS?

ElyOS combines the functionality of a traditional desktop OS with the flexibility of modern web technologies. Users access a full desktop environment — window management, taskbar, start menu, desktop shortcuts, context menus — entirely through the browser.

It's modular and extensible: build your own apps as plugins using the SDK, or self-host the entire platform with Docker.

## Features

- **Window Management** — drag, resize, minimize, maximize, snap
- **Taskbar & Start Menu** — customizable position, grid/list view, search
- **Desktop Shortcuts** — drag-and-drop, right-click context menu
- **Plugin System** — install third-party apps or build your own with `@elyos/sdk`
- **Authentication** — email/password, email OTP, Google sign-in, 2FA (TOTP)
- **Internationalization** — database-backed i18n with runtime locale switching
- **Real-time Chat** — built-in messaging via Socket.IO
- **Dark/Light Mode** — system-aware theme switching
- **Self-hostable** — single Docker Compose command to run everything

## Built-in Applications

| App            | Description                             |
| -------------- | --------------------------------------- |
| Settings       | Appearance, security, language, desktop |
| Users          | Account, group, and role management     |
| Log            | System and error log viewer             |
| Plugin Manager | Upload and install plugins              |
| Chat           | Real-time internal messaging            |
| Notifications  | System notification management          |
| Help           | Built-in documentation browser          |

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | SvelteKit 2, Svelte 5, TypeScript 5, Tailwind CSS 4 |
| Backend        | SvelteKit server, Express + Socket.IO               |
| Database       | PostgreSQL via Drizzle ORM                          |
| Auth           | better-auth (email, OTP, Google, 2FA)               |
| Runtime        | Bun                                                 |
| Infrastructure | Docker + Docker Compose                             |
| Testing        | Vitest, fast-check, Playwright                      |

## Quick Start

### Prerequisites

- [Docker](https://docker.com) and Docker Compose — required
  > **Recommended for macOS users:** Consider using [OrbStack](https://orbstack.dev) instead of Docker Desktop. OrbStack offers significantly faster container and VM startup, uses a fraction of the memory and CPU, integrates natively with macOS Keychain, and has a much smaller app footprint. It's also free for personal use.
- [Bun](https://bun.sh) (v1.0+) — optional, needed for the convenience `bun docker:*` commands; the system can be started without Bun using raw Docker commands directly

### Using Docker (recommended)

This method creates a fully self-contained, runnable system in Docker containers. Both ElyOS and the database run in containers, so **no local Node.js, Bun, or PostgreSQL installation is required** — Docker is all you need.

**With Bun (if installed):**

```bash
# Clone the repository
git clone https://github.com/ElyOS-webOS/elyos-core
cd elyos-core

# Copy environment config
cp .env.example .env

# Start ElyOS + PostgreSQL
bun docker:up

# Open in browser
open http://localhost:3000
```

**Without Bun (Docker only):**

```bash
# Clone the repository
git clone https://github.com/ElyOS-webOS/elyos-core
cd elyos-core

# Copy environment config
cp .env.example .env

# Start ElyOS + PostgreSQL
docker compose -f docker/docker-compose.yml up -d

# Open in browser
open http://localhost:3000
```

> **Important:** The `cp .env.example .env` command only creates the file — you **must** fill in the values (e.g. database password, secret keys, OAuth credentials) before starting the system.

### Local Development

```bash
# Install dependencies
bun install

# Copy environment config
cp .env.example .env

# Start PostgreSQL
bun docker:db

# Initialize database (generate + migrate + seed)
bun db:init

# Start dev server
bun app:dev
```

> **Important:** The `cp .env.example .env` command only creates the file — you **must** fill in the values (e.g. database password, secret keys, OAuth credentials) before starting the system.

The app will be available at `http://localhost:5173`.

### Common Commands

```bash
bun app:dev           # Start dev server
bun app:build         # Production build
bun app:check         # Type checking (svelte-check + tsc)

bun db:generate       # Generate migrations from schema changes
bun db:migrate        # Run pending migrations
bun db:studio         # Open Drizzle Studio
bun db:seed           # Seed database
bun db:reset          # Reset database

bun docker:up         # Start Docker containers
bun docker:down       # Stop Docker containers
bun docker:logs       # Follow container logs
bun docker:db         # Start only PostgreSQL (for local development)

bun test              # Run all tests (from apps/web)
bun lint              # Lint check
bun format            # Format code
```

## Project Structure

```
elyos-core/
├── apps/web/                     # Main SvelteKit application
│   └── src/
│       ├── routes/               # File-based routing
│       ├── apps/                 # Built-in desktop applications
│       └── lib/                  # Shared libraries, components, stores
├── packages/
│   ├── database/                 # Drizzle ORM schemas, migrations, seeds
│   ├── sdk/                      # @elyos/sdk — plugin SDK (npm)
│   └── create-elyos-plugin/      # CLI tool for scaffolding plugins (npm)
├── examples/plugins/             # Example plugin implementations
├── docker/                       # Dockerfile and docker-compose.yml
├── docs/                         # Documentation
└── .github/                      # CI/CD workflows, issue/PR templates
```

## Docker

### Self-hosting

```bash
bun docker:up
```

This starts the full system in three containers, in order:

1. **postgres** — PostgreSQL 18 database (custom image with `postgres-json-schema` extension)
2. **db-init** — one-time initialization: Drizzle migrations + seed data (only starts once postgres is healthy)
3. **elyos** — the application itself (only starts after db-init completes successfully)

The app will be available at `http://localhost:3000` (configurable via `ELYOS_PORT`), PostgreSQL on port `5432` (configurable via `POSTGRES_PORT`).

### Database initialization and reset

The `db-init` container (and the `bun db:init` script) is **idempotent** — safe to run multiple times without duplicating data (upsert logic).

If you need a full database reset (wipe all data and re-seed to initial state):

```bash
RESET=1 bun docker:up
```

This runs the same `db-init` container but truncates all tables before seeding.

### Environment Variables

See [`.env.example`](./.env.example) for all available configuration options, including database credentials, auth providers, and dev mode settings.

### Building the image

```bash
docker build -f docker/Dockerfile -t elyos/core:latest .
```

## Plugin Development

ElyOS comes with a complete plugin ecosystem. Create plugins with the CLI, develop with the mock SDK, then load them into a running ElyOS instance.

> **Coming soon...** Detailed documentation and guides for plugin development.

## Documentation

<!--
- [Plugin Development Guide](./docs/PLUGIN_DEVELOPMENT.md) — build plugins from scratch
- [API Reference](./docs/API_REFERENCE.md) — complete SDK API documentation
- [Migration Guide](./docs/MIGRATION.md) — migrate existing plugins to `@elyos/sdk`-->

- [Contributing Guide](./docs/CONTRIBUTING.md) — development setup, code style, PR process
- [User Documentation](https://docs.elyos.hu/en/) — user docs

## Contributing

We welcome contributions of all kinds — bug fixes, new features, documentation improvements, and plugin examples.

Please read the [Contributing Guide](./docs/CONTRIBUTING.md) before submitting a pull request.

## License

[MIT](./LICENSE)
