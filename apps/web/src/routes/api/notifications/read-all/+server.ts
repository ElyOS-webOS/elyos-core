import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificationRepository } from '$lib/server/database/repositories';

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for the current user
 */
export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = parseInt(locals.user.id);
		await notificationRepository.markAllAsRead(userId);
		return json({ success: true });
	} catch (error) {
		console.error('[API] Error marking all notifications as read:', error);
		return json({ error: 'Failed to mark all notifications as read' }, { status: 500 });
	}
};
