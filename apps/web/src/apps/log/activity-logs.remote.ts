import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { activityLogRepository } from '$lib/server/activity-log/repository';
import { permissionRepository } from '$lib/server/database/repositories';
import { validatePaginationParams } from '$lib/server/utils/database';

const fetchActivityLogsSchema = v.object({
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
	userId: v.optional(v.string()),
	actionKey: v.optional(v.string()),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export type FetchActivityLogsInput = v.InferOutput<typeof fetchActivityLogsSchema>;

export const fetchActivityLogs = command(fetchActivityLogsSchema, async (input) => {
	const event = getRequestEvent();
	const { locals } = event;

	// Hitelesítés ellenőrzése
	if (!locals.user?.id) {
		return { success: false as const, error: 'User not authenticated' };
	}

	// Jogosultság ellenőrzés: log.activity.view
	const userId = parseInt(locals.user.id);
	const permissions = await permissionRepository.findPermissionsForUser(userId);

	if (!permissions.includes('log.activity.view')) {
		return { success: false as const, error: 'Forbidden' };
	}

	// Locale lekérése a session-ből
	const locale = locals.locale || 'hu';

	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);

		const filters = {
			userId: input.userId || undefined,
			actionKey: input.actionKey || undefined,
			sortBy: input.sortBy || 'createdAt',
			sortOrder: input.sortOrder || 'desc',
			limit,
			offset
		};

		const [rows, totalCount] = await Promise.all([
			activityLogRepository.findMany(filters, locale),
			activityLogRepository.count(filters)
		]);

		return {
			success: true as const,
			data: rows,
			pagination: {
				page,
				pageSize: limit,
				totalCount,
				totalPages: Math.ceil(totalCount / limit)
			}
		};
	} catch (error) {
		console.error('Error fetching activity logs:', error);
		return {
			success: false as const,
			error: 'Failed to fetch activity logs'
		};
	}
});
