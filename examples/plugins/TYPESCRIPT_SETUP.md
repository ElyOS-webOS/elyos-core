# TypeScript Setup - WebOS Plugin

## Automatikus Típusok

A `@elyos/webos-sdk-types` package automatikusan biztosítja a TypeScript típusdefiníciókat a WebOS SDK-hoz.

## Telepítés

A hello-world példában már benne van, de új pluginban:

```bash
bun add -d @elyos/webos-sdk-types
```

## Használat

### Automatikus Window.webOS Típus

A package automatikusan kiterjeszti a `Window` interfészt:

```typescript
// ✅ TypeScript automatikusan ismeri a típust
const sdk = window.webOS;

// ✅ Autocomplete működik
sdk?.ui.toast('Hello!', 'success');
sdk?.remote.call('myFunction');
sdk?.data.set('key', 'value');
```

### Típusok Importálása

Ha explicit típusokat akarsz használni:

```typescript
import type {
	WebOSSDK,
	UserInfo,
	NotificationOptions,
	DialogOptions,
	CallOptions
} from '@elyos/webos-sdk-types';

// SDK típus
const sdk: WebOSSDK | undefined = window.webOS;

// User típus
const user: UserInfo | undefined = sdk?.context.user;

// Notification opciók típus
const options: NotificationOptions = {
	userId: 'user-123',
	title: 'Hello',
	message: 'World',
	type: 'info'
};

await sdk?.notifications.send(options);
```

### Svelte Komponensben

```svelte
<script lang="ts">
	import type { UserInfo } from '@elyos/webos-sdk-types';

	// SDK elérése
	const sdk = window.webOS;

	// Típusos változók
	let user: UserInfo | undefined = sdk?.context.user;
	let counter = $state<number>(0);
	let data = $state<any>(null);

	// Típusos függvények
	async function loadData(): Promise<void> {
		const result = await sdk?.data.get<{ value: string }>('myKey');
		data = result;
	}
</script>
```

## TSConfig

A hello-world példában már van `tsconfig.json`:

```json
{
	"compilerOptions": {
		"target": "ESNext",
		"module": "ESNext",
		"lib": ["ESNext", "DOM"],
		"moduleResolution": "bundler",
		"strict": true,
		"skipLibCheck": true,
		"types": ["svelte"]
	},
	"include": ["src/**/*"],
	"exclude": ["node_modules", "dist"]
}
```

## Elérhető Típusok

### Service Típusok

- `UIService` - UI műveletek
- `RemoteService` - Remote függvények
- `DataService` - Adattárolás
- `I18nService` - Fordítások
- `NotificationService` - Értesítések
- `ContextService` - Plugin kontextus
- `AssetService` - Asset URL-ek

### Adat Típusok

- `UserInfo` - Felhasználó információk
- `NotificationOptions` - Értesítés opciók
- `DialogOptions` - Dialógus opciók
- `DialogResult` - Dialógus eredmény
- `CallOptions` - Remote hívás opciók
- `ThemeColors` - Téma színek
- `WindowControls` - Ablak vezérlők
- `Transaction` - Adatbázis tranzakció

## Példák

### Remote Call Típusokkal

```typescript
import type { CallOptions } from '@elyos/webos-sdk-types';

interface ServerTimeResult {
	timestamp: number;
	iso: string;
	locale: string;
}

async function getServerTime() {
	const options: CallOptions = {
		timeout: 5000
	};

	const result = await sdk?.remote.call<ServerTimeResult>(
		'getServerTime',
		{ format: 'ISO' },
		options
	);

	console.log(result?.iso);
}
```

### Data Query Típusokkal

```typescript
interface MyData {
	id: number;
	name: string;
	value: string;
}

async function loadData() {
	const rows = await sdk?.data.query<MyData>('SELECT * FROM my_table WHERE id = $1', [123]);

	rows?.forEach((row) => {
		console.log(row.name); // ✅ TypeScript ismeri a típust
	});
}
```

### Notification Típusokkal

```typescript
import type { NotificationOptions } from '@elyos/webos-sdk-types';

async function sendNotification(userId: string, message: string) {
	const options: NotificationOptions = {
		userId,
		title: 'Important',
		message,
		type: 'warning'
	};

	await sdk?.notifications.send(options);
}
```

## Hibaelhárítás

### "Cannot find module '@elyos/webos-sdk-types'"

**Megoldás**: Telepítsd a package-et

```bash
bun install
```

### "Property 'webOS' does not exist on type 'Window'"

**Megoldás**:

1. Ellenőrizd, hogy a `@elyos/webos-sdk-types` telepítve van
2. Restart TypeScript Server (VSCode: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")
3. Restart IDE

### Típusok nem frissülnek

**Megoldás**:

```bash
# Töröld a node_modules-t és telepítsd újra
rm -rf node_modules
bun install
```

## Előnyök

✅ **Autocomplete**: TypeScript automatikusan javasolja a metódusokat
✅ **Type Safety**: Hibák fordítási időben, nem futásidőben
✅ **Dokumentáció**: JSDoc kommentek minden metóduson
✅ **Refactoring**: Biztonságos kód átszervezés
✅ **IntelliSense**: Paraméter információk és típusok

## Következő Lépések

- Nézd meg a [Plugin Fejlesztői Útmutatót](./PLUGIN_DEVELOPMENT_GUIDE.md)
- Próbáld ki a [Hello World példát](./hello-world/)
- Olvasd el a [WebOS SDK dokumentációt](../docs/SDK.md)

---

Sok sikert a típusos plugin fejlesztéshez! 🚀
