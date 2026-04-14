# WebOS Plugin Példák

Ez a könyvtár tartalmazza a WebOS plugin példákat és fejlesztői útmutatókat.

## 📚 Dokumentáció

- **[Plugin Fejlesztői Útmutató](./PLUGIN_DEVELOPMENT_GUIDE.md)** - Teljes útmutató plugin fejlesztéshez
- **[Hello World README](./hello-world/README.md)** - Hello World plugin részletes dokumentációja

## 🚀 Gyors Kezdés

### 1. Hello World Plugin Kipróbálása

```bash
# Lépj be a hello-world könyvtárba
cd examples/plugins/hello-world

# Telepítsd a függőségeket
bun install

# Build
bun run build

# Csomag készítése
bun run package
```

Ez létrehozza a `hello-world.wospkg` fájlt.

### 2. Plugin Feltöltése

**API-n keresztül (jelenleg ez az egyetlen mód):**

```bash
curl -X POST http://localhost:5173/api/plugins/upload \
  -F "file=@hello-world.wospkg"
```

**Megjegyzés**: A Settings → Plugins UI még nem lett implementálva (Fázis 6 - Admin UI). Jelenleg csak az API endpoint-ok működnek.

### 3. Plugin Használata

A plugin betöltése után használhatod a WebOS SDK-t:

```typescript
// Toast
window.webOS.ui.toast('Hello World!', 'success');

// Remote call
const time = await window.webOS.remote.call('getServerTime');

// Data storage
await window.webOS.data.set('key', 'value');

// I18n
const text = window.webOS.i18n.t('welcome');
```

## 📦 Példa Pluginok

### 1. Hello World

**Fájl**: `hello-world/`

**Funkciók**:

- ✅ UI Service demo (toast, komponensek)
- ✅ Remote Service demo (szerver függvények)
- ✅ Data Service demo (KV store, SQL query)
- ✅ I18n Service demo (magyar, angol)
- ✅ Notification Service demo
- ✅ Context Service demo
- ✅ Asset Service demo

**Használat**:

```bash
cd hello-world
bun install
bun run build
bun run package
```

### 2. Todo List (Később)

CRUD műveletek, adattárolás, szűrés, rendezés

### 3. Weather (Később)

Remote API hívások, cache-elés, error handling

### 4. Chat (Később)

Real-time kommunikáció, értesítések, WebSocket

## 🛠️ Új Plugin Készítése

### Módszer 1: Hello World Másolása

```bash
# Másold le a hello-world példát
cp -r hello-world my-plugin

# Lépj be
cd my-plugin

# Módosítsd a manifest.json-t
# - id: "my-plugin"
# - name: "My Plugin"
# - stb.

# Telepítsd a függőségeket
bun install

# Fejlesztés
bun run dev
```

### Módszer 2: Kézi Létrehozás

```bash
# Hozz létre egy új könyvtárat
mkdir my-plugin
cd my-plugin

# Inicializáld a bun projektet
bun init

# Telepítsd a függőségeket
bun add svelte lucide-svelte
bun add -d @sveltejs/vite-plugin-svelte vite archiver

# Hozd létre a fájlokat
touch manifest.json
touch vite.config.js
touch build-package.js
mkdir src server locales assets
touch src/App.svelte
touch server/functions.js
touch locales/hu.json
touch locales/en.json
```

Lásd a [Plugin Fejlesztői Útmutatót](./PLUGIN_DEVELOPMENT_GUIDE.md) a részletekért.

## 📋 Plugin Struktúra

```
my-plugin/
├── manifest.json          # ⚠️ KÖTELEZŐ
├── package.json
├── vite.config.js
├── build-package.js
├── src/
│   └── App.svelte         # ⚠️ KÖTELEZŐ
├── server/                # Opcionális
│   └── functions.js
├── locales/               # Opcionális
│   ├── hu.json
│   └── en.json
└── assets/                # Opcionális
    └── icon.svg
```

## 🔑 Manifest Példa

```json
{
	"id": "my-plugin",
	"name": "My Plugin",
	"version": "1.0.0",
	"description": "My awesome plugin",
	"author": "Your Name <your@email.com>",
	"entry": "dist/index.js",
	"icon": "assets/icon.svg",
	"permissions": ["database", "notifications", "remote_functions"],
	"dependencies": {
		"svelte": "^5.0.0",
		"lucide-svelte": "^0.263.1"
	},
	"minWebOSVersion": "2.0.0",
	"locales": ["hu", "en"]
}
```

## 🎯 WebOS SDK API

### UI Service

```typescript
window.webOS.ui.toast(message, type, duration);
window.webOS.ui.dialog(options);
window.webOS.ui.components; // Button, Input, Card, ...
window.webOS.ui.theme; // Téma színek
```

### Remote Service

```typescript
window.webOS.remote.call(functionName, params, options);
```

### Data Service

```typescript
window.webOS.data.set(key, value);
window.webOS.data.get(key);
window.webOS.data.delete(key);
window.webOS.data.query(sql, params);
window.webOS.data.transaction(callback);
```

### I18n Service

```typescript
window.webOS.i18n.t(key, params);
window.webOS.i18n.locale;
window.webOS.i18n.setLocale(locale);
```

### Notification Service

```typescript
window.webOS.notifications.send(options);
```

### Context Service

```typescript
window.webOS.context.pluginId;
window.webOS.context.user;
window.webOS.context.params;
window.webOS.context.permissions;
window.webOS.context.window.close();
window.webOS.context.window.setTitle(title);
```

### Asset Service

```typescript
window.webOS.assets.getUrl(assetPath);
```

## 🔒 Biztonsági Szabályok

### ❌ TILTOTT

- `eval()`, `Function()`
- `innerHTML`, `dangerouslySetInnerHTML`
- `document.write()`
- Külső domain-ekre fetch/XHR
- Más plugin sémák elérése

### ✅ ENGEDÉLYEZETT

- Svelte komponensek
- Lucide ikonok
- @racona/\* package-ek
- WebOS SDK API-k

## 📝 Jogosultságok

| Jogosultság        | Leírás                       |
| ------------------ | ---------------------------- |
| `database`         | Adatbázis hozzáférés         |
| `notifications`    | Értesítések küldése          |
| `remote_functions` | Szerver függvények           |
| `file_access`      | Fájl hozzáférés (később)     |
| `user_data`        | Felhasználói adatok (később) |

## 🐛 Hibaelhárítás

### "Invalid plugin ID format"

Plugin ID csak kisbetűket, számokat és kötőjelet tartalmazhat.

### "Permission denied"

Add hozzá a szükséges jogosultságot a `manifest.json`-ban.

### "Module not found"

Futtasd le a `bun run build` parancsot.

### "Invalid dependency"

Csak a fehérlistán lévő package-eket használd.

## 📚 További Dokumentáció

- [Plugin Fejlesztői Útmutató](./PLUGIN_DEVELOPMENT_GUIDE.md)
- [WebOS SDK API Referencia](../docs/API_REFERENCE.md)
- [Plugin Rendszer Tervezés](../../.kiro/specs/plugin-system/design.md)

## 💡 Tippek

1. **Kezdd a Hello World-del**: Nézd meg és módosítsd a példát
2. **Használj TypeScript-et**: Jobb típusbiztonság
3. **Tesztelj gyakran**: Build és upload minden változtatás után
4. **Kezelj le minden hibát**: Try-catch minden async műveletnél
5. **Dokumentáld a kódot**: Segít másoknak és a jövőbeli önmagadnak

## 🤝 Közreműködés

Ha új példa plugint szeretnél hozzáadni:

1. Hozz létre egy új könyvtárat
2. Kövesd a Hello World struktúráját
3. Írj részletes README-t
4. Tesztel alaposan
5. Készíts pull request-et

## 📄 Licenc

MIT

---

Sok sikert a plugin fejlesztéshez! 🚀
