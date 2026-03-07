/**
 * Remote function: felhasználó jogosultságainak lekérése.
 */
import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { permissionRepository } from '$lib/server/database/repositories';

const emptySchema = v.object({});

interface PermissionsResponse {
	success: boolean;
	error?: string;
	permissions: string[];
}

/**
 * Lekéri a bejelentkezett felhasználó összes jogosultságát.
 */
export const getUserPermissions = command(emptySchema, async (): Promise<PermissionsResponse> => {
	const event = getRequestEvent();
	const { locals } = event;

	if (!locals.user?.id) {
		return {
			success: false,
			error: 'User not authenticated',
			permissions: []
		};
	}

	const userId = parseInt(locals.user.id);

	try {
		const permissions = await permissionRepository.findPermissionsForUser(userId);
		return {
			success: true,
			permissions
		};
	} catch (error) {
		console.error('[Permissions] Error fetching user permissions:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			permissions: []
		};
	}
});
