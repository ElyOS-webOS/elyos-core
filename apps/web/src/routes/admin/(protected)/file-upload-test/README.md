# File Upload Test Oldal

Ez az oldal a FileUploader komponens tesztelésére szolgál, bemutatva mind az **instant**, mind a **standard** módot.

## Funkciók

### Beállítások

- **Kategória választás**: test-uploads, backgrounds, avatars, documents
- **Scope választás**: user (saját fájlok) vagy shared (közös)
- **Fájlok frissítése**: Betölti az aktuális kategória és scope szerinti fájlokat

### Instant Mód Példák

#### 1. Avatar feltöltés (instant)

- Kompakt, horizontális elrendezés
- Azonnali feltöltés kiválasztás után
- Előnézet a feltöltött fájlról
- Bélyegkép generálás
- Loading állapot jelzése
- Max 5MB, csak képek

#### 2. Dokumentum feltöltés (instant)

- Egyszerű, egysoros feltöltő
- PDF, Word, Excel fájlok
- Max 10MB

#### 3. Bármilyen fájl (instant)

- Minden fájltípus engedélyezett
- Max 20MB

### Standard Mód Példák

#### 1. Képfeltöltés (több fájl)

- Klasszikus drag & drop zóna
- Max 5 fájl egyszerre
- Fájl lista előnézettel
- Bélyegkép generálás
- Kép átméretezés (max 1920x1080)
- Külön feltöltés gomb

#### 2. Dokumentum feltöltés (több fájl)

- Max 3 fájl egyszerre
- PDF, Word, Excel támogatás
- Max 10MB/fájl

### Feltöltött Fájlok Lista

- Összes feltöltött fájl megjelenítése
- Képek előnézete
- Fájlméret megjelenítése
- Megnyitás új ablakban
- Törlés funkció

## Használat

1. Válaszd ki a kategóriát és scope-ot
2. Próbáld ki az instant módot:
   - Kattints vagy húzd be a fájlt
   - Automatikusan feltöltődik
   - Látod az eredményt azonnal
3. Próbáld ki a standard módot:
   - Válassz több fájlt
   - Nézd meg a listát
   - Törölj fájlokat ha kell
   - Kattints a "Feltöltés" gombra
4. Nézd meg a feltöltött fájlokat a lista szekcióban

## Különbségek

| Funkció         | Instant Mód         | Standard Mód               |
| --------------- | ------------------- | -------------------------- |
| Kinézet         | Kompakt, egysoros   | Nagy drag & drop zóna      |
| Fájl lista      | Nincs               | Van előnézet               |
| Feltöltés       | Automatikus         | Manuális gomb              |
| Több fájl       | Nem (maxFiles=1)    | Igen                       |
| Használati eset | Avatar, egyedi fájl | Batch upload, dokumentumok |
