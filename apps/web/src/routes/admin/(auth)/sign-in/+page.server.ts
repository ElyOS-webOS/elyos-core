import { env } from '$lib/env';
import type { PageServerLoad } from './$types';
import { translationRepository } from '$lib/server/database/repositories';

export const load: PageServerLoad = async ({ url, locals, depends }) => {
	depends('i18n:locale');

	const locale = locals.locale || env.DEFAULT_LOCALE;

	// Fordítás lekérése az adatbázisból
	const titleTranslation = await translationRepository.getByKey(locale, 'auth', 'signIn.title');

	return {
		title: titleTranslation?.value || '',
		registrationEnabled: env.REGISTRATION_ENABLED ?? false,
		socialLoginEnabled: env.SOCIAL_LOGIN_ENABLED ?? false,
		registered: url.searchParams.has('registered'),
		demoMode: env.DEMO_MODE ?? false
	};
};
