/**
 * Szerver oldali GlitchTip integráció.
 * Csak szerver kontextusban importálandó.
 *
 * Kikapcsolás: MONITORING_ENABLED=false (vagy GLITCHTIP_DSN elhagyása)
 */
import * as Sentry from '@sentry/node';

let initialized = false;

/**
 * Szerver oldali inicializálás (hooks.server.ts-ből hívandó).
 * Ha MONITORING_ENABLED=false vagy nincs DSN, no-op.
 */
export function initServerMonitoring(dsn: string, enabled: boolean, release?: string): void {
	if (!enabled || !dsn || initialized) return;

	Sentry.init({
		dsn,
		release,
		tracesSampleRate: 0.1
	});

	initialized = true;
	console.info('[Monitoring] GlitchTip szerver monitoring aktív.');
}

/**
 * Hiba manuális beküldése GlitchTip-re (szerver oldal).
 */
export function captureServerException(error: unknown, context?: Record<string, unknown>): void {
	if (!initialized) return;

	Sentry.withScope((scope) => {
		if (context) scope.setExtras(context);
		Sentry.captureException(error);
	});
}
