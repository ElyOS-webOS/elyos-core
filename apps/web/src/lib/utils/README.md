# Segédprogramok

Ez a könyvtár tartalmazza az alkalmazás segédprogramjait és utility funkcióit.

## Struktúra

### Kliens Oldali Segédprogramok (`src/lib/utils/`)

- **`utils.ts`**: Általános kliens oldali segédprogramok
  - `cn()`: Tailwind CSS osztályok kombinálása
  - `capitalizeFirstLetter()`: String első karakter nagybetűsítése
  - Svelte komponens típus segédprogramok

- **`validation.ts`**: Közös validációs segédprogramok (szerver és kliens oldalon is használható)
  - `LocalizedText` típus
  - `localizedTextSchema` validációs séma

- **`index.ts`**: Központi export fájl az összes segédprogramhoz

### Szerver Oldali Segédprogramok (`src/lib/server/utils/`)

- **`database.ts`**: Adatbázis kapcsolatos segédprogramok
  - `handleDatabaseError()`: PostgreSQL hibák kezelése
  - `sanitizeSqlParameter()`: SQL paraméter validálás
  - `validatePaginationParams()`: Lapozási paraméterek validálása

- **`auth.ts`**: Hitelesítési segédprogramok
  - `validatePasswordStrength()`: Jelszó erősség ellenőrzése
  - `validateEmail()`: Email cím validálása
  - `validateUsername()`: Felhasználónév validálása

- **`index.ts`**: Szerver oldali segédprogramok központi exportja

### Alkalmazás-Specifikus Segédprogramok

- **`src/lib/apps/shared/utils.ts`**: Alkalmazások közötti megosztott segédprogramok
  - Alkalmazás metaadatok validálása
  - Kategória színek és ikonok
  - Alkalmazás azonosító validálás

## Használat

A segédprogramok a központi index fájlon keresztül importálhatók:

```typescript
import { cn, capitalizeFirstLetter } from '$lib/utils';
```

## Előnyök

1. **Jobb Szervezés**: Kliens és szerver oldali segédprogramok elkülönítése
2. **Könnyebb Karbantartás**: Központi export fájlok használata
3. **Típusbiztonság**: Megfelelő TypeScript típusok és validációk
4. **Újrafelhasználhatóság**: Közös segédprogramok könnyű elérése
5. **Skálázhatóság**: Új segédprogramok egyszerű hozzáadása
