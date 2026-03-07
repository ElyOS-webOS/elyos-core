/**
 * Root Layout Server Load
 *
 * Passes the locale to all pages for i18n initialization.
 *
 * Requirements: 5.4
 */
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		locale: locals.locale
	};
};
