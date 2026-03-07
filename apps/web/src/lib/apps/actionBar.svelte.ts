/**
 * Action Bar rendszer.
 *
 * Lehetővé teszi, hogy a dinamikusan betöltött komponensek tetszőleges tartalmat
 * (gombokat, elemeket) jelenítsenek meg az AppLayout alsó funkciósávjában.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { getActionBar } from '$lib/apps/actionBar.svelte';
 *   const actionBar = getActionBar();
 *
 *   // Snippet regisztrálása
 *   actionBar.set(mySnippet);
 *
 *   // Törlés (pl. onDestroy-ban automatikus)
 * </script>
 *
 * {#snippet mySnippet()}
 *   <Button onclick={handleSave}>Mentés</Button>
 * {/snippet}
 * ```
 */

import type { Snippet } from 'svelte';
import { getContext, setContext } from 'svelte';

const ACTION_BAR_KEY = Symbol('actionBar');

export interface ActionBarContext {
	/** Az aktuális action bar snippet (null ha nincs). */
	readonly content: Snippet | null;
	/** Snippet beállítása az action bar-ba. */
	set: (snippet: Snippet) => void;
	/** Action bar tartalom törlése. */
	clear: () => void;
}

/**
 * Action bar context létrehozása és regisztrálása.
 * Csak az AppLayout-ban kell meghívni.
 */
export function createActionBar(): ActionBarContext {
	let content = $state<Snippet | null>(null);

	const ctx: ActionBarContext = {
		get content() {
			return content;
		},
		set(snippet: Snippet) {
			content = snippet;
		},
		clear() {
			content = null;
		}
	};

	setContext(ACTION_BAR_KEY, ctx);
	return ctx;
}

/**
 * Action bar context lekérése.
 * A dinamikusan betöltött komponensekből hívható.
 */
export function getActionBar(): ActionBarContext {
	return getContext<ActionBarContext>(ACTION_BAR_KEY);
}
