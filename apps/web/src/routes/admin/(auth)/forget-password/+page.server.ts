import type { PageServerLoad } from './$types';
import { translationRepository } from '$lib/server/database/repositories';
import { env } from '$lib/env';

export const load: PageServerLoad = async ({ locals, depends }) => {
	depends('i18n:locale');

	const locale = locals.locale || env.DEFAULT_LOCALE;

	// Fordítás lekérése az adatbázisból
	const titleTranslation = await translationRepository.getByKey(
		locale,
		'auth',
		'forgotPassword.title'
	);

	return {
		title: titleTranslation?.value || ''
	};
};
