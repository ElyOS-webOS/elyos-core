import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificationRepository } from '$lib/server/database/repositories';

/**
 * POST /api/notifications/[id]/read
 * Mark a notification as read
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const notificationId = parseInt(params.id);
		await notificationRepository.markAsRead(notificationId);
		return json({ success: true });
	} catch (error) {
		console.error('[API] Error marking notification as read:', error);
		return json({ error: 'Failed to mark notification as read' }, { status: 500 });
	}
};
