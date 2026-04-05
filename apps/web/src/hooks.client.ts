import type { HandleClientError } from '@sveltejs/kit';
import { clientErrorReporter } from '$lib/logging/client-reporter';
import { initClientMonitoring, captureException } from '$lib/monitoring';

// GlitchTip inicializálása kliens indításkor.
// Kikapcsolható: MONITORING_ENABLED=false vagy PUBLIC_GLITCHTIP_DSN elhagyásával.
const dsn = (import.meta as any).env?.PUBLIC_ERROR_TRACKING_DSN as string | undefined;
const monitoringEnabled = (import.meta as any).env?.PUBLIC_MONITORING_ENABLED !== 'false';
if (monitoringEnabled && dsn) {
	initClientMonitoring(dsn, true);
}

const FETCH_TIMEOUT = 15_000; // 15 másodperc

export const handleError: HandleClientError = async ({ error, status, message }) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : undefined;

	await clientErrorReporter.report({
		message: errorMessage,
		stack,
		context: {
			status,
			originalMessage: message
		}
	});

	// GlitchTip-re is elküldjük
	await captureException(error, { status, originalMessage: message });

	return {
		message: 'Unexpected Error'
	};
};

// Globális hibakezelők a SvelteKit-en kívüli kezeletlen hibákhoz
if (typeof window !== 'undefined') {
	// Globális fetch timeout - megakadályozza, hogy a remote function hívások
	// végtelen ideig lógjanak ha a szerver leáll
	const originalFetch = window.fetch;
	window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
		// Ha már van AbortSignal beállítva, ne írjuk felül
		if (init?.signal) {
			return originalFetch.call(this, input, init);
		}

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

		return originalFetch
			.call(this, input, { ...init, signal: controller.signal })
			.then((response) => {
				clearTimeout(timeoutId);
				return response;
			})
			.catch((error) => {
				clearTimeout(timeoutId);
				if (error.name === 'AbortError') {
					throw new Error('A szerver nem válaszolt időben');
				}
				throw error;
			});
	};

	window.addEventListener('error', (event) => {
		clientErrorReporter.report({
			message: event.message || 'Unknown error',
			stack: event.error?.stack,
			context: {
				source: 'window.onerror',
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno
			}
		});
	});

	window.addEventListener('unhandledrejection', (event) => {
		const error = event.reason;
		const errorMessage = error instanceof Error ? error.message : String(error);
		const stack = error instanceof Error ? error.stack : undefined;

		clientErrorReporter.report({
			message: errorMessage,
			stack,
			context: {
				source: 'unhandledrejection'
			}
		});
	});
}
