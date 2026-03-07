<p align="center">
  <img src="https://elyos.hu/logo.png" alt="ElyOS Logo" width="120" />
</p>

<!-- <h1 align="center">ElyOS</h1> -->

<p align="center">
  Modern, webalapú operációs rendszer — teljes asztali élmény a böngészőben.
</p>

<p align="center">
  <!-- <a href="https://www.npmjs.com/package/@elyos/sdk"><img src="https://img.shields.io/npm/v/@elyos/sdk?label=%40elyos%2Fsdk&color=blue" alt="npm verzió" /></a>
  <a href="https://hub.docker.com/r/elyos/core"><img src="https://img.shields.io/docker/pulls/elyos/core" alt="Docker letöltések" /></a>
  <a href="https://github.com/elyos/core/actions"><img src="https://img.shields.io/github/actions/workflow/status/elyos/core/ci.yml?branch=main&label=CI" alt="CI státusz" /></a> -->
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="Licenc" /></a>
</p>

<p align="center">
  <a href="https://elyos.hu">Weboldal</a> · <a href="https://docs.elyos.hu">Dokumentáció (felhasználói)</a> · <!-- <a href="./docs/hu/PLUGIN_DEVELOPMENT.md">Plugin fejlesztés</a> ·--> <a href="./docs/hu/CONTRIBUTING.md">Közreműködés</a>
</p>

---

<!-- Screenshot placeholder -->
<!-- <p align="center"><img src="https://elyos.hu/screenshots/desktop.png" alt="ElyOS Asztal" width="800" /></p> -->

## Mi az ElyOS?

Az ElyOS ötvözi a hagyományos asztali operációs rendszerek funkcionalitását a modern webtechnológiák rugalmasságával. A felhasználók teljes asztali környezetet érnek el — ablakkezelés, tálca, start menü, asztali parancsikonok, helyi menü — kizárólag a böngészőn keresztül.

Moduláris és bővíthető: készíts saját alkalmazásokat pluginként az SDK segítségével, vagy futtasd az egész platformot önállóan Dockerrel.

## Funkciók

- **Ablakkezelés** — húzás, átméretezés, minimalizálás, maximalizálás, illesztés
- **Tálca és Start menü** — testreszabható pozíció, rács/lista nézet, keresés
- **Asztali parancsikonok** — drag-and-drop, jobb kattintásos helyi menü
- **Plugin rendszer** — telepíts harmadik féltől származó alkalmazásokat, vagy készíts sajátot az `@elyos/sdk`-val
- **Hitelesítés** — email/jelszó, email OTP, Google bejelentkezés, 2FA (TOTP)
- **Többnyelvűség** — adatbázis-alapú i18n, futásidejű nyelvváltással
- **Valós idejű chat** — beépített üzenetküldés Socket.IO-n keresztül
- **Sötét/Világos mód** — rendszerszintű témaváltás
- **Önállóan futtatható** — egyetlen Docker Compose paranccsal elindítható

## Beépített alkalmazások

| Alkalmazás    | Leírás                               |
| ------------- | ------------------------------------ |
| Beállítások   | Megjelenés, biztonság, nyelv, asztal |
| Felhasználók  | Fiók-, csoport- és szerepkörkezelés  |
| Napló         | Rendszer- és hibanapló megjelenítő   |
| Plugin kezelő | Pluginok feltöltése és telepítése    |
| Chat          | Valós idejű belső üzenetküldés       |
| Értesítések   | Rendszerértesítések kezelése         |
| Súgó          | Beépített dokumentációböngésző       |

## Tech Stack

| Réteg          | Technológia                                         |
| -------------- | --------------------------------------------------- |
| Frontend       | SvelteKit 2, Svelte 5, TypeScript 5, Tailwind CSS 4 |
| Backend        | SvelteKit szerver, Express + Socket.IO              |
| Adatbázis      | PostgreSQL Drizzle ORM-en keresztül                 |
| Hitelesítés    | better-auth (email, OTP, Google, 2FA)               |
| Runtime        | Bun                                                 |
| Infrastruktúra | Docker + Docker Compose                             |
| Tesztelés      | Vitest, fast-check, Playwright                      |

## Gyors kezdés

### Előfeltételek

- [Docker](https://docker.com) és Docker Compose — kötelező
  > **macOS felhasználóknak ajánlott:** Docker Desktop helyett érdemes [OrbStack](https://orbstack.dev)-et használni. Az OrbStack lényegesen gyorsabb konténer- és VM-indítást kínál, töredék annyi memóriát és CPU-t fogyaszt, natívan integrálja a macOS Keychain-t, és sokkal kisebb az alkalmazás mérete is. Ráadásul ingyenes személyes használatra.
- [Bun](https://bun.sh) (v1.0+) — opcionális, az előre definiált `bun docker:*` parancsok kényelmes futtatásához szükséges; Bun nélkül is elindítható a rendszer, csak a nyers Docker-parancsokat kell használni

### Docker segítségével (ajánlott)

Ez a módszer egy teljesen önálló, futtatható rendszert hoz létre Docker konténerekben. Az ElyOS és az adatbázis egyaránt konténerben fut, így **nincs szükség Node.js, Bun vagy PostgreSQL helyi telepítésére** — elegendő a Docker megléte.

**Bun segítségével (ha telepítve van):**

```bash
# Repository klónozása
git clone https://github.com/ElyOS-webOS/elyos-core
cd elyos-core

# Környezeti konfiguráció másolása
cp .env.example .env

# ElyOS + PostgreSQL indítása
bun docker:up

# Megnyitás böngészőben
open http://localhost:3000
```

**Bun nélkül (csak Docker szükséges):**

```bash
# Repository klónozása
git clone https://github.com/ElyOS-webOS/elyos-core
cd elyos-core

# Környezeti konfiguráció másolása
cp .env.example .env

# ElyOS + PostgreSQL indítása
docker compose -f docker/docker-compose.yml up -d

# Megnyitás böngészőben
open http://localhost:3000
```

> **Fontos:** A `cp .env.example .env` parancs csak létrehozza a fájlt — a benne lévő értékeket (pl. adatbázis jelszó, titkos kulcsok, OAuth azonosítók) **kötelező** a saját környezetednek megfelelően kitölteni, mielőtt elindítod a rendszert.

### Lokális fejlesztés

```bash
# Függőségek telepítése
bun install

# Környezeti konfiguráció másolása
cp .env.example .env

# PostgreSQL indítása
bun docker:db

# Adatbázis inicializálása (generálás + migráció + seed)
bun db:init

# Fejlesztői szerver indítása
bun app:dev
```

> **Fontos:** A `cp .env.example .env` parancs csak létrehozza a fájlt — a benne lévő értékeket (pl. adatbázis jelszó, titkos kulcsok, OAuth azonosítók) **kötelező** a saját környezetednek megfelelően kitölteni, mielőtt elindítod a rendszert.

Az alkalmazás elérhető lesz a `http://localhost:5173` címen.

### Gyakori parancsok

```bash
bun app:dev           # Fejlesztői szerver indítása
bun app:build         # Éles build
bun app:check         # Típusellenőrzés (svelte-check + tsc)

bun db:generate       # Migrációk generálása sémaváltozásokból
bun db:migrate        # Függőben lévő migrációk futtatása
bun db:studio         # Drizzle Studio megnyitása
bun db:seed           # Adatbázis feltöltése tesztadatokkal
bun db:reset          # Adatbázis visszaállítása

bun docker:up         # Docker konténerek indítása
bun docker:down       # Docker konténerek leállítása
bun docker:logs       # Konténer naplók követése
bun docker:db         # Csak PostgreSQL indítása (lokális fejlesztéshez)

bun test              # Összes teszt futtatása (apps/web-ből)
bun lint              # Lint ellenőrzés
bun format            # Kód formázása
```

## Projekt struktúra

```
elyos-core/
├── apps/web/                     # Fő SvelteKit alkalmazás
│   └── src/
│       ├── routes/               # Fájlalapú routing
│       ├── apps/                 # Beépített asztali alkalmazások
│       └── lib/                  # Megosztott könyvtárak, komponensek, store-ok
├── packages/
│   ├── database/                 # Drizzle ORM sémák, migrációk, seed-ek
│   ├── sdk/                      # @elyos/sdk — plugin SDK (npm)
│   └── create-elyos-plugin/      # CLI eszköz plugin generáláshoz (npm)
├── examples/plugins/             # Példa plugin implementációk
├── docker/                       # Dockerfile és docker-compose.yml
├── docs/                         # Dokumentáció
└── .github/                      # CI/CD workflow-ok, issue/PR sablonok
```

## Plugin fejlesztés

Az ElyOS teljes plugin ökoszisztémával rendelkezik. Hozz létre pluginokat a CLI-vel, fejlessz a mock SDK-val, majd töltsd be őket egy futó ElyOS példányba.

> **Hamarosan...** Részletes dokumentáció és útmutatók a plugin fejlesztéshez.

## Docker

### Önálló futtatás

```bash
bun docker:up
```

Ez elindítja a teljes rendszert három konténerben, sorban:

1. **postgres** — PostgreSQL 18 adatbázis (egyedi image, `postgres-json-schema` extensionnel)
2. **db-init** — egyszeri inicializálás: Drizzle migrációk + seed adatok betöltése (csak akkor indul, ha a postgres egészséges)
3. **elyos** — maga az alkalmazás (csak akkor indul, ha a db-init sikeresen lefutott)

Az alkalmazás elérhető lesz a `http://localhost:3000` címen (konfigurálható: `ELYOS_PORT`), a PostgreSQL az `5432`-es porton (konfigurálható: `POSTGRES_PORT`).

### Adatbázis inicializálás és reset

A `db-init` konténer (és a `bun db:init` script) **idempotens** — biztonságosan futtatható többször is, nem duplikál adatokat (upsert logika).

Ha teljes adatbázis-visszaállításra van szükség (minden adat törlése és újraseedelés a kezdeti állapotba):

```bash
RESET=1 bun docker:up
```

Ez ugyanazt a `db-init` konténert futtatja, de truncate-eli az összes táblát a seed előtt.

### Környezeti változók

Az összes konfigurációs lehetőségért lásd a [`.env.example`](./.env.example) fájlt.

### Image build

```bash
docker build -f docker/Dockerfile -t elyos/core:latest .
```

## Dokumentáció

<!--
- [Plugin fejlesztési útmutató](./docs/hu/PLUGIN_DEVELOPMENT.md) — pluginok készítése nulláról
- [API referencia](./docs/hu/API_REFERENCE.md) — teljes SDK API dokumentáció
- [Migrációs útmutató](./docs/hu/MIGRATION.md) — meglévő pluginok migrálása `@elyos/sdk`-ra -->

- [Közreműködési útmutató](./docs/hu/CONTRIBUTING.md) — fejlesztői beállítás, kódstílus, PR folyamat
- [Felhasználói dokumentáció](https://docs.elyos.hu) — felhasználói leírás

## Közreműködés

Minden típusú hozzájárulást szívesen fogadunk — hibajavítások, új funkciók, dokumentációs fejlesztések és plugin példák egyaránt.

Kérjük, olvasd el a [Közreműködési útmutatót](./docs/hu/CONTRIBUTING.md) a pull request beküldése előtt.

## Licenc

[MIT](./LICENSE)
