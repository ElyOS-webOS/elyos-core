import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import {
	userRepository,
	type ProfileData,
	type UpdateProfileResult
} from '$lib/server/database/repositories';
import { activityLogService } from '$lib/server/activity-log/service';

/**
 * Profil frissítés validációs séma
 * _Requirements: 4.2, 4.4, 4.5_
 */
const updateProfileSchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(1, 'A név megadása kötelező'),
		v.maxLength(100, 'A név maximum 100 karakter lehet')
	),
	username: v.optional(
		v.nullable(
			v.union([
				v.literal(''),
				v.pipe(
					v.string(),
					v.regex(
						/^[a-zA-Z0-9_]+$/,
						'A felhasználónév csak betűket, számokat és aláhúzást tartalmazhat'
					),
					v.minLength(3, 'A felhasználónév minimum 3 karakter'),
					v.maxLength(50, 'A felhasználónév maximum 50 karakter')
				)
			])
		)
	),
	image: v.optional(v.nullable(v.string()))
});

/**
 * Üres séma a getProfile command-hoz (nincs bemeneti paraméter)
 */
const emptySchema = v.object({});

/**
 * Profil adatok lekérdezése.
 * Visszaadja a bejelentkezett felhasználó profil adatait, beleértve az OAuth információkat,
 * csoportokat és szerepköröket.
 * @returns GetProfileResult típus a profil adatokkal vagy hibaüzenettel.
 * _Requirements: 8.4_
 */
export const getProfile = command(
	emptySchema,
	async (): Promise<{
		success: boolean;
		profile?: ProfileData & {
			groups: Array<{
				id: number;
				name: string | Record<string, string>;
				description: string | Record<string, string> | null;
			}>;
			roles: Array<{
				id: number;
				name: string | Record<string, string>;
				description: string | Record<string, string> | null;
			}>;
		};
		error?: string;
	}> => {
		const event = getRequestEvent();
		const { locals } = event;

		// Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
		if (!locals.user?.id) {
			return {
				success: false,
				error: 'User not authenticated'
			};
		}

		const userId = parseInt(locals.user.id);

		try {
			const profile = await userRepository.getProfileWithOAuth(userId);

			if (!profile) {
				return {
					success: false,
					error: 'Profile not found'
				};
			}

			// Csoportok és szerepkörök lekérdezése
			const userWithGroupsAndRoles = await userRepository.findByIdWithGroupsAndRoles(userId);

			return {
				success: true,
				profile: {
					...profile,
					groups:
						userWithGroupsAndRoles?.groups.map((g) => ({
							id: g.id,
							name: g.name as string | Record<string, string>,
							description: g.description as string | Record<string, string> | null
						})) || [],
					roles:
						userWithGroupsAndRoles?.roles.map((r) => ({
							id: r.id,
							name: r.name as string | Record<string, string>,
							description: r.description as string | Record<string, string> | null
						})) || []
				}
			};
		} catch (error) {
			console.error('Get profile error:', error);
			return {
				success: false,
				error: 'Hiba történt a profil lekérdezése során'
			};
		}
	}
);

/**
 * Profil frissítése.
 * Frissíti a bejelentkezett felhasználó profil adatait (név, felhasználónév, avatar).
 * @param data - A frissítendő profil adatok (name, username, image).
 * @returns UpdateProfileResult típus a frissített adatokkal vagy hibaüzenettel.
 * _Requirements: 2.4, 3.5, 7.2, 8.4_
 */
export const updateProfile = command(
	updateProfileSchema,
	async (data): Promise<UpdateProfileResult> => {
		const event = getRequestEvent();
		const { locals } = event;

		// Ellenőrizzük, hogy be van-e jelentkezve a felhasználó
		if (!locals.user?.id) {
			return {
				success: false,
				error: 'User not authenticated'
			};
		}

		const userId = parseInt(locals.user.id);

		// Validáljuk a nevet (whitespace-only nem megengedett)
		if (!data.name || data.name.trim().length === 0) {
			return {
				success: false,
				error: 'A név megadása kötelező'
			};
		}

		// Készítsük elő a frissítendő adatokat
		const updateData = {
			name: data.name.trim(),
			username: data.username === '' ? null : data.username,
			image: data.image
		};

		const result = await userRepository.updateProfile(userId, updateData);

		if (result.success) {
			console.log('Profile updated:', result.user);
			activityLogService.log({
				actionKey: 'user.profile.updated',
				userId: String(userId),
				resourceType: 'user',
				resourceId: String(userId)
			});
		}

		return result;
	}
);
