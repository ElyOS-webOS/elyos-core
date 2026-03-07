import type { LayoutServerLoad } from './$types';
import { env } from '$lib/env';

export const load: LayoutServerLoad = async ({ locals, depends }) => {
	depends('app:settings');

	// Támogatott nyelvek kódjai az ENV-ből
	const supportedLocaleCodes = env.SUPPORTED_LOCALES || ['hu', 'en'];

	return {
		settings: locals.settings,
		locale: locals.locale,
		supportedLocales: supportedLocaleCodes,
		user: locals.user,
		appName: env.APP_NAME,
		devMode: env.DEV_MODE === true
	};
};
