/**
 * Dev Mode Store
 *
 * Globális, reaktív dev mode állapot.
 * A layout server-ből kapott DEV_MODE értéket tárolja kliens oldalon.
 * A menürendszer és komponensek használják a fejlesztői funkciók megjelenítéséhez.
 */

let devMode = $state(false);

/**
 * Dev mode beállítása a szerver layout adatai alapján.
 * Egyszer hívódik meg a protected layout inicializálásakor.
 */
export function setDevMode(value: boolean): void {
	devMode = value;
}

/**
 * Dev mode állapot lekérdezése.
 */
export function isDevMode(): boolean {
	return devMode;
}
