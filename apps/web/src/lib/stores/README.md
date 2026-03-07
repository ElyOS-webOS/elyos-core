# Állapotkezelés és Store-ok

Ez a könyvtár tartalmazza az alkalmazás globális állapotkezelését és store-jait.

## Struktúra

### Globális Store-ok (`src/lib/stores/`)

- **windowStore.svelte.ts**: Ablakkezelési állapot (WindowManager osztály)
- **themeStore.svelte.ts**: Téma és megjelenési beállítások (ThemeManager osztály)
- **index.ts**: Központi export fájl az egyszerűsített importokhoz

### Alkalmazás-specifikus Store-ok

Az alkalmazás-specifikus store-ok az egyes alkalmazások `stores/` mappájában találhatók:

```
src/lib/apps/[app-name]/stores/
```

## Állapotkezelési Minták

### Svelte 5 Runes Használata

Az alkalmazás Svelte 5 rune-okat használ a reaktivitáshoz:

```typescript
class MyManager {
  data = $state<MyData>({ ... });

  updateData(newData: Partial<MyData>) {
    this.data = { ...this.data, ...newData };
  }
}
```

### Singleton Pattern

A globális store-ok singleton mintát követnek:

```typescript
let globalManager: MyManager | null = null;

export function createMyManager() {
	if (!globalManager) {
		globalManager = new MyManager();
	}
	return globalManager;
}

export function getMyManager(): MyManager {
	try {
		return getContext(MY_MANAGER_KEY);
	} catch {
		if (!globalManager) {
			globalManager = new MyManager();
		}
		return globalManager;
	}
}
```

### Context API Integráció

A store-ok Svelte context API-val is integráltak:

```typescript
const MY_MANAGER_KEY = Symbol('myManager');

export function setMyManager(manager: MyManager) {
	globalManager = manager;
	setContext(MY_MANAGER_KEY, manager);
}
```

## Importálás

### Központi Import (Ajánlott)

```typescript
import { getWindowManager, getThemeManager } from '$lib/stores';
```

### Közvetlen Import

```typescript
import { getWindowManager } from '$lib/stores/windowStore.svelte';
import { getThemeManager } from '$lib/stores/themeStore.svelte';
```

## Alkalmazás-specifikus Store-ok Létrehozása

Új alkalmazás-specifikus store létrehozásához:

1. Hozz létre egy fájlt az alkalmazás `stores/` mappájában
2. Kövesd a globális store-ok mintáját
3. Használj Svelte 5 rune-okat a reaktivitáshoz
4. Exportáld a store-t az alkalmazás index fájljából

Példa:

```typescript
// src/lib/apps/myapp/stores/myAppStore.svelte.ts
class MyAppManager {
  state = $state<MyAppState>({ ... });

  // ... methods
}

export function createMyAppManager() {
  return new MyAppManager();
}
```

## Konzisztencia Irányelvek

1. **Rune-ok használata**: Minden új store Svelte 5 rune-okat használjon
2. **Singleton pattern**: Globális store-ok singleton mintát kövessenek
3. **Context integráció**: Store-ok legyenek context API-val kompatibilisek
4. **TypeScript**: Minden store legyen típusbiztos
5. **Központi exportok**: Használj központi export fájlokat az egyszerűsített importokhoz
