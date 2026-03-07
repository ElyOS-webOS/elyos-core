/**
 * Permission Store
 *
 * Globális, reaktív jogosultság-kezelő store.
 * Egyszer tölti be a user jogosultságait, utána szinkron ellenőrzés bárhonnan.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { hasPermission } from '$lib/stores';
 * </script>
 *
 * {#if hasPermission('log.error.delete')}
 *   <button>Törlés</button>
 * {/if}
 * ```
 */
import { getUserPermissions } from '$lib/services/server/permissions.remote';
import { withTimeout } from '$lib/utils/remote';

let userPermissions = $state<Set<string>>(new Set());
let loaded = $state(false);
let loading = $state(false);

/**
 * Betölti a bejelentkezett felhasználó jogosultságait a szerverről.
 * Csak egyszer hívódik meg (pl. layout init), utána cache-ből szolgál ki.
 */
export async function loadPermissions(): Promise<void> {
	if (loaded || loading) return;
	loading = true;

	try {
		const result = await withTimeout(getUserPermissions({}));
		if (result.success) {
			userPermissions = new Set(result.permissions);
		} else {
			console.error('[PermissionStore] Failed to load permissions:', result.error);
			userPermissions = new Set();
		}
		loaded = true;
	} catch (error) {
		console.error('[PermissionStore] Error loading permissions:', error);
		userPermissions = new Set();
	} finally {
		loading = false;
	}
}

/**
 * Ellenőrzi, hogy a felhasználónak van-e adott jogosultsága.
 *
 * @param permission - A jogosultság neve (pl. "log.error.view")
 * @returns true, ha a felhasználónak megvan a jogosultsága
 */
export function hasPermission(permission: string): boolean {
	return userPermissions.has(permission);
}

/**
 * Ellenőrzi, hogy a felhasználónak megvan-e BÁRMELYIK a megadott jogosultságok közül.
 *
 * @param perms - Jogosultság nevek tömbje
 * @returns true, ha legalább egy jogosultsága megvan
 */
export function hasAnyPermission(perms: string[]): boolean {
	return perms.some((p) => userPermissions.has(p));
}

/**
 * Ellenőrzi, hogy a felhasználónak megvan-e AZ ÖSSZES megadott jogosultság.
 *
 * @param perms - Jogosultság nevek tömbje
 * @returns true, ha az összes jogosultsága megvan
 */
export function hasAllPermissions(perms: string[]): boolean {
	return perms.every((p) => userPermissions.has(p));
}

/**
 * Visszaadja a felhasználó összes jogosultságát (readonly).
 */
export function getPermissions(): ReadonlySet<string> {
	return userPermissions;
}

/**
 * Betöltődtek-e már a jogosultságok.
 */
export function isPermissionsLoaded(): boolean {
	return loaded;
}

/**
 * Újratölti a jogosultságokat (pl. role változás után).
 */
export async function reloadPermissions(): Promise<void> {
	loaded = false;
	loading = false;
	await loadPermissions();
}
