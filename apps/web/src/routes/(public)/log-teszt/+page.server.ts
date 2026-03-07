import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { logger } from '$lib/server/logging';

export const actions: Actions = {
	debug: async () => {
		await logger.debug('Teszt debug üzenet', {
			source: 'log-teszt',
			context: { action: 'manual-debug' }
		});
		return { level: 'debug', success: true };
	},

	info: async () => {
		await logger.info('Teszt info üzenet', {
			source: 'log-teszt',
			context: { action: 'manual-info' }
		});
		return { level: 'info', success: true };
	},

	warn: async () => {
		await logger.warn('Teszt figyelmeztetés', {
			source: 'log-teszt',
			context: { action: 'manual-warn', detail: 'Ez egy szándékos figyelmeztetés' }
		});
		return { level: 'warn', success: true };
	},

	error: async () => {
		await logger.error('Teszt hiba üzenet', {
			source: 'log-teszt',
			stack: new Error('Szimulált hiba').stack,
			context: { action: 'manual-error' }
		});
		return { level: 'error', success: true };
	},

	fatal: async () => {
		await logger.fatal('Teszt fatális hiba', {
			source: 'log-teszt',
			stack: new Error('Szimulált fatális hiba').stack,
			context: { action: 'manual-fatal', severity: 'critical' }
		});
		return { level: 'fatal', success: true };
	},

	'server-throw': async () => {
		// Ez a handleError hook-on keresztül kerül naplózásra
		throw new Error('Szándékosan dobott szerver hiba a teszt oldalról');
	},

	'server-fail': async () => {
		// A fail() nem hiba — validációs válasz, nem naplózódik
		return fail(422, { message: 'Szándékos validációs hiba' });
	}
} satisfies Actions;
