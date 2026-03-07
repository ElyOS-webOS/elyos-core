import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificationRepository } from '$lib/server/database/repositories';
import { sendNotification } from '$lib/server/socket';

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userId = parseInt(locals.user.id);
		const notifications = await notificationRepository.getByUserId(userId);
		return json({ notifications });
	} catch (error) {
		console.error('[API] Error fetching notifications:', error);
		return json({ error: 'Failed to fetch notifications' }, { status: 500 });
	}
};

/**
 * POST /api/notifications
 * Send a notification
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const payload = await request.json();
		console.log('[API] Received notification payload:', payload);

		// Validate payload
		if (!payload.title || !payload.message) {
			return json({ error: 'Title and message are required' }, { status: 400 });
		}

		// Convert userId to number if provided
		const notificationPayload = {
			...payload,
			userId: payload.userId
				? typeof payload.userId === 'number'
					? payload.userId
					: parseInt(payload.userId)
				: undefined,
			userIds: payload.userIds
				? payload.userIds.map((id: string | number) => (typeof id === 'number' ? id : parseInt(id)))
				: undefined
		};

		console.log('[API] Converted notification payload:', notificationPayload);

		await sendNotification(notificationPayload);

		return json({ success: true });
	} catch (error) {
		console.error('[API] Error sending notification:', error);
		return json({ error: 'Failed to send notification' }, { status: 500 });
	}
};
