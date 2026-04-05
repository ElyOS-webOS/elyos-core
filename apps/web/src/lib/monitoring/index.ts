/**
 * GlitchTip / Sentry-kompatibilis hibafigyelő integráció.
 *
 * Kikapcsolás: MONITORING_ENABLED=false (vagy PUBLIC_GLITCHTIP_DSN elhagyása)
 * Ha egyik sincs beállítva, az összes hívás no-op.
 */

let initialized = false;

// Dinamikus import — csak ha a DSN be van állítva, hogy ne növelje a bundle méretet
async function getSentry() {
	if (typeof window !== 'undefined') {
		return await import('@sentry/sveltekit');
	}
	return null;
}

/**
 * Kliens oldali inicializálás (hooks.client.ts-ből hívandó).
 * Ha enabled=false vagy nincs DSN, no-op.
 */
export async function initClientMonitoring(
	dsn: string,
	enabled: boolean,
	release?: string
): Promise<void> {
	if (!enabled || !dsn || initialized) return;

	const Sentry = await getSentry();
	if (!Sentry) return;

	Sentry.init({
		dsn,
		release,
		tracesSampleRate: 0.1,
		// GlitchTip nem támogatja a session replay-t, ezért ki van kapcsolva
		replaysSessionSampleRate: 0,
		replaysOnErrorSampleRate: 0
	});

	initialized = true;
}

/**
 * Hiba manuális beküldése GlitchTip-re (kliens oldal).
 */
export async function captureException(
	error: unknown,
	context?: Record<string, unknown>
): Promise<void> {
	if (!initialized) return;

	const Sentry = await getSentry();
	if (!Sentry) return;

	Sentry.withScope((scope) => {
		if (context) scope.setExtras(context);
		Sentry.captureException(error);
	});
}
