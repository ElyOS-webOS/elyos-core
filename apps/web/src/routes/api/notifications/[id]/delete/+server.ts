import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificationRepository } from '$lib/server/database/repositories';

/**
 * DELETE /api/notifications/[id]/delete
 * Delete a specific notification
 */
export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const notificationId = parseInt(params.id);
		await notificationRepository.delete(notificationId);
		return json({ success: true });
	} catch (error) {
		console.error('[API] Error deleting notification:', error);
		return json({ error: 'Failed to delete notification' }, { status: 500 });
	}
};
