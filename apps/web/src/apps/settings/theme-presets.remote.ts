'use server';

import { command } from '$app/server';
import * as v from 'valibot';
import { themePresetsRepository } from '$lib/server/database/repositories';

export const getThemePresets = command(
	v.object({
		locale: v.pipe(v.string(), v.minLength(2, 'Locale is required'))
	}),
	async ({ locale }) => {
		try {
			const presets = await themePresetsRepository.getAll(locale);
			return presets;
		} catch (error) {
			console.error('Failed to fetch theme presets:', error);
			throw new Error('Failed to fetch theme presets');
		}
	}
);
