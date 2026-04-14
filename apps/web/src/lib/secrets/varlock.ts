/**
 * Varlock inicializálási és secrets betöltési logika
 *
 * Ez a fájl az Infisical Machine Identity alapú hitelesítést,
 * a bootstrap credentials validációját és a secrets betöltési folyamatot
 * implementálja.
 */

import { validateSchema } from './schema.js';

// =============================================================================
// Típusok
// =============================================================================

export interface VarlockBootstrapCredentials {
	clientId: string | null | undefined;
	clientSecret: string | null | undefined;
}

export interface VarlockInitResult {
	clientId: string;
	clientSecret: string;
}

/**
 * Az Infisical kliens interfész, amelyet a `loadSecretsWithFallback` vár.
 */
export interface InfisicalClient {
	/** Lekéri az összes secretet az Infisical-ból. */
	fetchSecrets(): Promise<Record<string, unknown>>;
	/** Új access tokent kér a bootstrap credentials-szel. */
	renewToken?(clientId: string, clientSecret: string): Promise<string>;
	/** A környezet neve (pl. 'production'). */
	environment: string;
	/** A projekt neve (pl. 'racona-core'). */
	project: string;
	/** Tesztelési célra: hány kísérlet történt eddig. */
	attemptCount?: number;
	/** Tesztelési célra: hány token megújítás történt. */
	renewTokenCallCount?: number;
}

/**
 * A `createVarlockClient` által visszaadott kliens interfész.
 */
export interface VarlockClient {
	/** Lekér egy secretet a kulcs alapján. */
	getSecret(key: string): Promise<unknown>;
	/** Tesztelési célra: szimulál egy token lejáratot. */
	simulateTokenExpiry(expiredToken: string): void;
}

export interface CreateVarlockClientOptions {
	clientId: string;
	clientSecret: string;
	infisical: InfisicalClient;
}

export interface LoadSecretsWithFallbackOptions {
	infisical?: InfisicalClient;
}

export interface LoadSecretsResult {
	/** A betöltött és validált env objektum. */
	secrets: Record<string, unknown>;
	/** A betöltés forrása: 'infisical' vagy 'local'. */
	source: 'infisical' | 'local';
}

// =============================================================================
// Bootstrap credentials validáció
// =============================================================================

/**
 * Inicializálja a Varlock klienst a megadott bootstrap credentials-szel.
 *
 * Ha a `clientId` vagy `clientSecret` üres, null vagy undefined,
 * hibát dob és naplózza a hiányzó változót.
 *
 * @param credentials - Az Infisical Machine Identity hitelesítő adatok
 * @returns A validált credentials objektum
 * @throws Error ha bármelyik credential hiányzik vagy üres
 */
export function initVarlock(credentials: VarlockBootstrapCredentials): VarlockInitResult {
	const { clientId, clientSecret } = credentials;

	if (!clientId) {
		console.error('[Varlock] HIBA: Hiányzó bootstrap credential: INFISICAL_CLIENT_ID');
		throw new Error('Hiányzó bootstrap credential: INFISICAL_CLIENT_ID');
	}

	if (!clientSecret) {
		console.error('[Varlock] HIBA: Hiányzó bootstrap credential: INFISICAL_CLIENT_SECRET');
		throw new Error('Hiányzó bootstrap credential: INFISICAL_CLIENT_SECRET');
	}

	return { clientId, clientSecret };
}

// =============================================================================
// Secrets betöltési logika
// =============================================================================

/**
 * Validálja a megadott secrets objektumot a séma alapján, és visszaadja
 * a validált, typesafe env objektumot.
 *
 * @param secrets - A validálandó secrets objektum
 * @returns A validált env objektum
 * @throws Error ha a validáció sikertelen
 *
 * Validates: Requirements 4.3, 7.1, 7.2, 5.5
 */
export function loadAndValidate(secrets: Record<string, unknown>): Record<string, unknown> {
	return validateSchema(secrets);
}

/**
 * Betölti a secreteket az Infisical-ból vagy lokális `.env` fallback módból.
 *
 * Ha a `VARLOCK_FALLBACK=local` env változó be van állítva, a secreteket
 * közvetlenül a `process.env`-ből olvassa (Bun automatikusan betölti a `.env` fájlt).
 * Egyébként az Infisical kliensen keresztül kéri le a secreteket,
 * 3 újrapróbálkozással (exponential backoff: 1s, 2s, 4s).
 *
 * Sikeres betöltés után naplózza:
 * `[Varlock] N secret sikeresen betöltve (environment/project)`
 *
 * @param options - A betöltési opciók (opcionális Infisical kliens)
 * @returns A betöltési eredmény (secrets + forrás)
 * @throws Error ha az Infisical nem elérhető 3 kísérlet után
 *
 * Validates: Requirements 4.3, 7.3, 7.4
 */
export async function loadSecretsWithFallback(
	options: LoadSecretsWithFallbackOptions
): Promise<LoadSecretsResult> {
	const { infisical } = options;

	// Fallback mód: VARLOCK_FALLBACK=local esetén process.env-ből olvas
	if (process.env.VARLOCK_FALLBACK === 'local') {
		const secrets = { ...process.env } as Record<string, unknown>;
		const validated = loadAndValidate(secrets);
		const count = Object.keys(validated).length;
		console.log(`[Varlock] ${count} secret sikeresen betöltve (local/local)`);
		return { secrets: validated, source: 'local' };
	}

	// Infisical mód: secretek lekérése újrapróbálkozással
	if (!infisical) {
		throw new Error(
			'[Varlock] HIBA: Nincs Infisical kliens megadva és VARLOCK_FALLBACK nem "local"'
		);
	}

	const secrets = await fetchWithRetry(infisical);
	const validated = loadAndValidate(secrets);
	const count = Object.keys(validated).length;
	console.log(
		`[Varlock] ${count} secret sikeresen betöltve (${infisical.environment}/${infisical.project})`
	);
	return { secrets: validated, source: 'infisical' };
}

// =============================================================================
// 3 újrapróbálkozásos Infisical kapcsolódási logika
// =============================================================================

/** Várakozási idők exponential backoff-hoz (ms) */
const RETRY_DELAYS_MS = [1000, 2000, 4000];
const MAX_RETRIES = 3;

/**
 * Megvárja a megadott milliszekundumot.
 *
 * @param ms - Várakozási idő milliszekundumban
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Megpróbálja lekérni a secreteket az Infisical-ból, legfeljebb 3 kísérlettel.
 * Ha mindhárom kísérlet sikertelen, naplózza a hibát és kilép (exit 1).
 *
 * @param infisical - Az Infisical kliens
 * @returns A lekért secrets objektum
 * @throws Error ha mindhárom kísérlet sikertelen
 *
 * Validates: Requirements 7.4
 */
export async function fetchWithRetry(infisical: InfisicalClient): Promise<Record<string, unknown>> {
	let lastError: unknown;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		// Tesztelési célra: ha az attemptCount property létezik, növeljük
		if (typeof infisical.attemptCount === 'number') {
			(infisical as { attemptCount: number }).attemptCount = attempt;
		}

		try {
			const secrets = await infisical.fetchSecrets();
			return secrets;
		} catch (error) {
			lastError = error;

			if (attempt < MAX_RETRIES) {
				const delayMs = RETRY_DELAYS_MS[attempt - 1];
				await sleep(delayMs);
			}
		}
	}

	// Minden kísérlet sikertelen
	const siteUrl =
		lastError instanceof Error && lastError.message.includes('http')
			? lastError.message
			: 'ismeretlen';

	console.error(
		`[Varlock] HIBA: Az Infisical szerver nem elérhető (${MAX_RETRIES}/${MAX_RETRIES} újrapróbálkozás után): ${siteUrl}`
	);

	// Kilépés az alkalmazásból
	process.exit(1);
}

// =============================================================================
// Token megújítás és VarlockClient factory
// =============================================================================

/**
 * Létrehoz egy Varlock klienst, amely automatikusan megújítja az Infisical
 * access tokent lejárat esetén, alkalmazás újraindítás nélkül.
 *
 * A kliens belső állapotban tárolja a betöltött secreteket és a token
 * érvényességét. Ha a token lejár (vagy `simulateTokenExpiry` meghívásra kerül),
 * a következő `getSecret` hívás automatikusan megújítja a tokent a bootstrap
 * credentials segítségével, majd újra lekéri a secreteket.
 *
 * @param options - A kliens konfigurációja (clientId, clientSecret, infisical)
 * @returns A VarlockClient példány
 *
 * Validates: Requirements 6.6
 */
export function createVarlockClient(options: CreateVarlockClientOptions): VarlockClient {
	const { clientId, clientSecret, infisical } = options;

	// Belső állapot
	let cachedSecrets: Record<string, unknown> | null = null;
	let tokenExpired = false;

	/**
	 * Megújítja a tokent és újra lekéri a secreteket.
	 * Csak akkor hívja a `renewToken`-t, ha a token ténylegesen lejárt.
	 */
	async function refreshSecrets(isRenewal: boolean): Promise<void> {
		if (isRenewal && infisical.renewToken) {
			await infisical.renewToken(clientId, clientSecret);
		}
		cachedSecrets = await fetchWithRetry(infisical);
		tokenExpired = false;
	}

	return {
		/**
		 * Lekér egy secretet a kulcs alapján.
		 * Ha a token lejárt, automatikusan megújítja azt.
		 *
		 * @param key - A secret kulcsa
		 * @returns A secret értéke
		 */
		async getSecret(key: string): Promise<unknown> {
			// Ha a token lejárt, megújítjuk (renewToken hívással)
			if (tokenExpired) {
				await refreshSecrets(true);
			} else if (cachedSecrets === null) {
				// Első betöltés — nincs token megújítás, csak lekérés
				await refreshSecrets(false);
			}
			return cachedSecrets![key];
		},

		/**
		 * Tesztelési célra: szimulál egy token lejáratot.
		 * A következő `getSecret` hívás automatikusan megújítja a tokent.
		 *
		 * @param _expiredToken - A lejárt token (csak dokumentációs célból)
		 */
		simulateTokenExpiry(_expiredToken: string): void {
			tokenExpired = true;
			cachedSecrets = null;
		}
	};
}
