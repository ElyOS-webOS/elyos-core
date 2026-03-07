import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { notificationRepository } from '$lib/server/database/repositories';

/**
 * POST /api/notifications/test
 * Create a test notification for the current user (dev mode helper)
 */
export const POST: RequestHandler = async ({ locals }) => {
	try {
		if (!locals.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = parseInt(locals.user.id);

		const notification = await notificationRepository.create({
			userId,
			appName: 'system',
			title: 'Teszt Értesítés',
			message: `Ez egy teszt értesítés ${new Date().toLocaleTimeString('hu-HU')}`,
			type: 'info',
			data: { timestamp: new Date().toISOString() }
		});

		return json({
			success: true,
			notification,
			message: 'Teszt értesítés létrehozva! Kattints a 🔄 gombra a harang ikon mellett.'
		});
	} catch (error) {
		console.error('[API] Error creating test notification:', error);
		return json(
			{
				error: 'Failed to create test notification',
				details: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
