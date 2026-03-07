import type { ProfileData } from '$lib/server/database/repositories';

/**
 * Avatar megjelenítési eredmény típusa
 */
export interface DisplayedAvatar {
	type: 'custom' | 'oauth' | 'placeholder';
	url: string | null;
	initials?: string;
}

/**
 * Meghatározza a megjelenítendő avatart a prioritási logika alapján.
 * Prioritás: egyéni avatar > OAuth kép > placeholder iniciálékkal
 *
 * @param profile - A felhasználó profil adatai
 * @returns DisplayedAvatar objektum a megjelenítendő avatar információkkal
 *
 * _Requirements: 1.2, 1.3, 1.4_
 */
export function getDisplayedAvatar(profile: ProfileData): DisplayedAvatar {
	// 1. Prioritás: Egyéni feltöltött avatar (ha különbözik az OAuth képtől)
	if (profile.image && profile.image !== profile.oauthImage) {
		return {
			type: 'custom',
			url: profile.image
		};
	}

	// 2. Prioritás: OAuth szolgáltatótól származó kép
	if (profile.oauthImage) {
		return {
			type: 'oauth',
			url: profile.oauthImage
		};
	}

	// 3. Prioritás: Placeholder iniciálékkal
	const initials = getUserInitials(profile.name);
	return {
		type: 'placeholder',
		url: null,
		initials
	};
}

/**
 * Generál iniciálékat a felhasználó nevéből.
 * - Ha a név több szóból áll, az első két szó első betűjét használja
 * - Ha a név egy szóból áll, az első két betűt használja
 * - Ha a név üres, "?" karaktert ad vissza
 *
 * @param name - A felhasználó teljes neve
 * @returns Az iniciálék nagybetűvel (max 2 karakter)
 *
 * _Requirements: 1.4_
 */
export function getUserInitials(name: string): string {
	if (!name || name.trim().length === 0) {
		return '?';
	}

	const trimmedName = name.trim();
	const words = trimmedName.split(/\s+/).filter((word) => word.length > 0);

	if (words.length === 0) {
		return '?';
	}

	if (words.length === 1) {
		// Egy szó esetén az első két betűt használjuk
		const word = words[0];
		if (word.length === 1) {
			return word.charAt(0).toUpperCase();
		}
		return (word.charAt(0) + word.charAt(1)).toUpperCase();
	}

	// Több szó esetén az első két szó első betűjét használjuk
	return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}
