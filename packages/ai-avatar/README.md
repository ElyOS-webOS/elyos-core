# AI Avatar Packager

Ez a csomag egy CLI eszköz, amely AI avatar fájlokat `.raconapkg` archívumba csomagol.

## Használat

### 1. Készítsd elő a fájlokat

Hozz létre egy könyvtárat az avatar fájloknak, és helyezd el benne a következő fájlokat:

```
my-avatar/
├── my-avatar_hd.glb      # HD minőségű 3D modell
├── my-avatar_sd.glb      # SD minőségű 3D modell
├── my-avatar_cover.jpg   # Előnézeti kép (cover)
└── manifest.json         # Avatar metaadatok
```

**Fontos:** A fájlnevek **kebab-case** formátumban legyenek (kisbetűk, kötőjellel elválasztva).

### 2. Fájl követelmények

#### GLB modellek (`*_hd.glb`, `*_sd.glb`)

- Formátum: GLB (GLTF Binary)
- HD modell: magasabb poligonszám, részletesebb textúrák
- SD modell: optimalizált teljesítményre, alacsonyabb poligonszám
- **Legalább az egyik kötelező** (SD vagy HD), de mindkettő is lehet

A manifest `availableQualities` mezője határozza meg, hogy melyik fájlok kötelezőek:

- `["sd"]` → csak `{name}_sd.glb` kell
- `["hd"]` → csak `{name}_hd.glb` kell
- `["sd", "hd"]` → mindkét fájl kell

#### Cover kép (`*_cover.jpg`)

- Formátum: JPEG
- Ajánlott méret: 512×512 px vagy 1024×1024 px
- Négyzet alakú (1:1 arány)
- Az avatar előnézeti képe a kiválasztó felületen

#### Manifest (`manifest.json`)

A manifest fájl tartalmazza az avatar metaadatait. Lásd a minta fájlt alább.

### 3. Csomagolás

**A packages/ai-avatar könyvtárból:**

```bash
cd packages/ai-avatar
bun run pack tiger
```

Ez automatikusan az `installers/tiger/` mappában keresi a fájlokat, és az `installers/tiger/dist/` mappába helyezi a generált csomagot.

**Paraméter:** Az avatar neve (kebab-case formátumban, pl. `tiger`, `fox`)

A packager az `installers/{avatar-neve}/` mappában keresi a fájlokat.

Például ha `bun run pack fox`-ot futtatsz, akkor az `installers/fox/` mappában keresi:

- `fox/fox_hd.glb`
- `fox/fox_sd.glb`
- `fox/fox_cover.jpg`
- `fox/manifest.json`

### 4. Kimenet

A packager létrehoz egy `.raconapkg` fájlt a `dist/` almappában:

```
my-avatar/
├── my-avatar_hd.glb
├── my-avatar_sd.glb
├── my-avatar_cover.jpg
├── manifest.json
└── dist/
    └── my-avatar_ai_avatar.raconapkg  ← Generált csomag
```

Ez a fájl feltölthető az AI Assistant alkalmazás **Telepítés** menüpontjában.

**Megjegyzés:** A `dist/` mappa automatikusan létrejön, és a `.gitignore` kizárja, így a generált csomagok nem kerülnek be a verziókezelésbe.

## Manifest.json struktúra

A `manifest.json` fájl kötelező mezői:

```json
{
	"idname": "my-avatar",
	"displayName": "My Avatar",
	"descriptions": {
		"hu": "Az én egyedi avatárom",
		"en": "My custom avatar"
	},
	"availableQualities": ["sd", "hd"]
}
```

### Mezők

- **`idname`** (string, kötelező): Az avatar egyedi azonosítója kebab-case formátumban. Egyezzen meg a fájlnevek prefixével.
- **`displayName`** (string, kötelező): Az avatar megjelenítendő neve (bármilyen formátumban).
- **`descriptions`** (object, kötelező): Többnyelvű leírások.
  - **`hu`** (string, kötelező): Magyar leírás.
  - **`en`** (string, kötelező): Angol leírás.
- **`availableQualities`** (array, kötelező): Elérhető minőségi szintek. Legalább egy elem kötelező.
  - Lehetséges értékek: `"sd"` (standard definition), `"hd"` (high definition)
  - Példák:
    - `["sd"]` — csak SD modell
    - `["hd"]` — csak HD modell
    - `["sd", "hd"]` — mindkét modell elérhető

**Fontos:** A `availableQualities` tömbben megadott minőségi szinteknek megfelelő GLB fájloknak léteznie kell:

- Ha `"sd"` szerepel → `{idname}_sd.glb` kötelező
- Ha `"hd"` szerepel → `{idname}_hd.glb` kötelező

## Példa teljes folyamat

```bash
# 1. Könyvtár létrehozása az installers alatt
cd packages/ai-avatar/installers
mkdir cool-robot
cd cool-robot

# 2. Fájlok elhelyezése
# - cool-robot_hd.glb
# - cool-robot_sd.glb
# - cool-robot_cover.jpg
# - manifest.json

# 3. Vissza a packages/ai-avatar könyvtárba
cd ../..

# 4. Csomagolás
bun run pack cool-robot

# 5. Kimenet
# ✓ cool-robot_ai_avatar.raconapkg elkészült az installers/cool-robot/dist/ mappában
```

## Hibaüzenetek

### "A {név} könyvtár nem található"

A packager nem találja a megadott nevű mappát. Ellenőrizd:

- Létezik-e a mappa az aktuális könyvtárban?
- Jól írtad-e a nevet?

Példa: Ha `bun run pack fox`-ot futtatsz, akkor a `./fox/` mappának léteznie kell.

### "Hiányzó fájl"

Ellenőrizd, hogy minden kötelező fájl megvan-e a megadott mappában:

- `{name}_hd.glb`
- `{name}_sd.glb`
- `{name}_cover.jpg`
- `manifest.json`

Példa: Ha az avatar neve `fox`, akkor a `fox/` mappában kell lennie:

- `fox/fox_hd.glb`
- `fox/fox_sd.glb`
- `fox/fox_cover.jpg`
- `fox/manifest.json`

### "A manifest.json érvénytelen"

Ellenőrizd a manifest.json struktúráját:

- Van-e `idname`, `displayName`, `descriptions`, `availableQualities` mező?
- A `descriptions` objektumban van-e `hu` és `en` kulcs?
- Az `idname` kebab-case formátumú-e?
- Az `availableQualities` egy tömb, amely legalább egy elemet tartalmaz (`"sd"` vagy `"hd"`)?
- Az `availableQualities` tömbben csak `"sd"` és `"hd"` értékek szerepelnek?

### "Hiányzó fájl: {name}\_sd.glb vagy {name}\_hd.glb"

A manifest `availableQualities` mezőjében megadott minőségi szinteknek megfelelő GLB fájloknak léteznie kell:

- Ha `availableQualities: ["sd"]` → csak `{name}_sd.glb` kötelező
- Ha `availableQualities: ["hd"]` → csak `{name}_hd.glb` kötelező
- Ha `availableQualities: ["sd", "hd"]` → mindkét fájl kötelező

## Telepítés

A létrehozott `.raconapkg` fájlt az AI Assistant alkalmazásban telepítheted:

1. Nyisd meg az **AI Asszisztens** alkalmazást
2. Válaszd a **Telepítés** menüpontot
3. Töltsd fel a `.raconapkg` fájlt
4. A sikeres telepítés után az avatar megjelenik a **Beállítások** menüpontban
