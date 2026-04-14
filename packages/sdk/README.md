# @racona/sdk

The official SDK for building [Racona](https://racona.hu) apps. Provides runtime services (injected by Racona), a mock SDK for standalone development, and full TypeScript type definitions.

<a href="https://www.npmjs.com/package/@racona/sdk"><img src="https://img.shields.io/npm/v/@racona/sdk?color=blue" alt="npm version" /></a>
<a href="https://jsr.io/@racona/sdk"><img src="https://jsr.io/badges/@racona/sdk" alt="JSR" /></a>
<a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="License" /></a>
<a href="https://ko-fi.com/racona"><img src="https://img.shields.io/badge/Support-Ko--fi-FF5E5B?logo=ko-fi&logoColor=white" alt="Support on Ko-fi" /></a>

## Installation

```bash
# npm / bun
bun add @racona/sdk

# JSR (Deno / Bun / Node)
bunx jsr add @racona/sdk
# or
deno add jsr:@racona/sdk
```

## Package Exports

| Export              | Description                                   |
| ------------------- | --------------------------------------------- |
| `@racona/sdk`       | Runtime SDK (injected by Racona at load time) |
| `@racona/sdk/dev`   | Mock SDK for standalone development           |
| `@racona/sdk/types` | TypeScript type definitions only              |

## Quick Start

### Runtime Mode (inside Racona)

When your app runs inside Racona, the SDK is automatically injected into `window.webOS`:

```ts
const sdk = window.webOS!;

sdk.ui.toast('Hello from my app!', 'success');

const user = sdk.context.user;
console.log(`Logged in as ${user.name}`);
```

### Development Mode (standalone)

For local development without a running Racona instance, use the mock SDK:

```ts
// src/main.ts
import { MockWebOSSDK } from '@racona/sdk/dev';

if (!window.webOS) {
	MockWebOSSDK.initialize({
		context: {
			pluginId: 'my-app',
			user: { id: '1', name: 'Dev User', email: 'dev@example.com', roles: ['admin'], groups: [] }
		},
		i18n: {
			locale: 'en',
			translations: {
				en: { greeting: 'Hello, {name}!' },
				hu: { greeting: 'Szia, {name}!' }
			}
		}
	});
}

const sdk = window.webOS!;
sdk.ui.toast('Running in dev mode', 'info'); // → logs to console
```

The mock SDK simulates all services locally:

- Toasts and dialogs log to the browser console
- Data storage uses `localStorage`
- Remote calls can be configured with custom handlers
- i18n works with provided translation maps

### Types Only

```ts
import type { WebOSSDKInterface, UIService, DataService } from '@racona/sdk/types';
```

## API Overview

### `ui` — UI Service

```ts
sdk.ui.toast('Saved!', 'success', 3000);
const result = await sdk.ui.dialog({ title: 'Confirm', message: 'Delete?', type: 'confirm' });
const theme = sdk.ui.theme; // Current theme colors
const components = sdk.ui.components; // Racona UI components
```

### `data` — Data Service

```ts
await sdk.data.set('settings', { darkMode: true });
const settings = await sdk.data.get<{ darkMode: boolean }>('settings');
await sdk.data.delete('settings');

// SQL queries (requires `database` permission)
const rows = await sdk.data.query<User>('SELECT * FROM users WHERE active = $1', [true]);

// Transactions
await sdk.data.transaction(async (tx) => {
	await tx.query('INSERT INTO items (name) VALUES ($1)', ['New Item']);
	await tx.commit();
});
```

### `remote` — Remote Service

```ts
const result = await sdk.remote.call<{ items: Item[] }>('getItems', { page: 1 });
const saved = await sdk.remote.call('saveItem', { name: 'Test' }, { timeout: 5000 });
```

### `i18n` — Internationalization Service

```ts
const label = sdk.i18n.t('greeting', { name: 'World' }); // "Hello, World!"
const currentLocale = sdk.i18n.locale; // "en"
await sdk.i18n.setLocale('hu');
await sdk.i18n.ready(); // Wait for translations to load
```

### `notifications` — Notification Service

```ts
// Requires `notifications` permission
await sdk.notifications.send({
	userId: 'user-123',
	title: 'New message',
	message: 'You have a new message',
	type: 'info'
});
```

### `context` — Context Service

```ts
const pluginId = sdk.context.pluginId;
const user = sdk.context.user; // { id, name, email, roles, groups }
const params = sdk.context.params; // Parameters passed when opening the app
const perms = sdk.context.permissions; // ['database', 'notifications', ...]

sdk.context.window.setTitle('My App — Settings');
sdk.context.window.close();
```

### `assets` — Asset Service

```ts
const iconUrl = sdk.assets.getUrl('icon.svg');
const imageUrl = sdk.assets.getUrl('images/banner.png');
```

## TypeScript Support

All service interfaces are exported from `@racona/sdk/types`:

```ts
import type {
	WebOSSDKInterface,
	UIService,
	RemoteService,
	DataService,
	I18nService,
	NotificationService,
	ContextService,
	AssetService,
	UserInfo,
	ThemeColors,
	DialogOptions,
	DialogResult,
	ToastType,
	MockSDKConfig,
	PluginErrorCode
} from '@racona/sdk/types';
```

## Further Reading

For documentation, visit [docs.racona.hu](https://docs.racona.hu).

## License

MIT

---

## Changelog

### [0.3.0] - 2026-04-14

- **Changed**: Package renamed from `@elyos-dev/sdk` to `@racona/sdk`
- **Changed**: All import paths updated from `@elyos-dev/sdk` to `@racona/sdk`

### [0.2.1] - 2026-04-12

- **Added**: `SimpleDataTable` component (`@racona/sdk/dev/components/SimpleDataTable.svelte`) — standalone DataTable without TanStack Table, with pagination, sorting, toolbar snippet, and action buttons
- **Added**: `SimpleRowActions` component (`@racona/sdk/dev/components/SimpleRowActions.svelte`) — primary button + dropdown for secondary actions
- **Added**: `MockWebOSSDK.initialize(config, extraComponents?)` — new `extraComponents` parameter for synchronous component registration before app mount
- **Added**: `WebOSComponents` interface typed fields for `DataTable`, `DataTableColumnHeader`, `renderComponent`, `renderSnippet`, `createActionsColumn`, `Input`, `Button`
- **Added**: `MockUIService.components` now includes `createActionsColumn`, `renderComponent`, `renderSnippet`, `DataTableColumnHeader` mock implementations by default
- **Added**: SDK package exports for `./dev/components/SimpleDataTable.svelte` and `./dev/components/SimpleRowActions.svelte`

### [0.2.0] - 2026-04-11

- **Changed**: Version bump to align all Racona packages at `0.2.0` — no breaking changes, fully compatible with `0.1.x`

### [0.1.22] - 2026-04-10

- **Added**: `UIService.navigateTo(component, props?)` — navigate between views in sidebar/menu-based plugins
- **Added**: `UIService.setActionBar(items)` — set action bar buttons for the current view
- **Added**: `UIService.clearActionBar()` — clear the action bar
- **Added**: `ActionBarItem` type — interface for action bar button definitions (`label`, `onClick`, `variant`, `icon`, `disabled`)
- **Added**: `DialogOptions.confirmLabel` — custom label for the confirm button
- **Added**: `DialogOptions.confirmVariant` — visual variant (`default` | `destructive`) for the confirm button
- **Added**: `DialogOptions`, `DialogResult`, `ActionBarItem` exported from main entry point

### [0.1.1] - 2026-03-08

- Initial release — runtime SDK, mock SDK for dev, full TypeScript types
