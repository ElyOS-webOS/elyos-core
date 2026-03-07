import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificationRepository } from '$lib/server/database/repositories';

/**
 * POST /api/notifications/delete-all
 * Delete all notifications for the current user
 */
export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = parseInt(locals.user.id);
		await notificationRepository.deleteAllByUserId(userId);
		return json({ success: true });
	} catch (error) {
		console.error('[API] Error deleting all notifications:', error);
		return json({ error: 'Failed to delete all notifications' }, { status: 500 });
	}
};
