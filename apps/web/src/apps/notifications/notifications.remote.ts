import { command } from '$app/server';
import * as v from 'valibot';
import { notificationRepository } from '$lib/server/database/repositories';
import { validatePaginationParams } from '$lib/server/utils/database';
import { getRequestEvent } from '$app/server';

const fetchNotificationsSchema = v.object({
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export type FetchNotificationsInput = v.InferOutput<typeof fetchNotificationsSchema>;

export const fetchNotifications = command(fetchNotificationsSchema, async (input) => {
	try {
		const event = getRequestEvent();
		const userId = event?.locals.user?.id;
		if (!userId) {
			return {
				success: false as const,
				error: 'Unauthorized',
				data: [],
				pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
			};
		}

		const userIdNum = parseInt(userId);
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);

		const [rows, totalCount] = await Promise.all([
			notificationRepository.findManyPaginated({
				userId: userIdNum,
				limit,
				offset,
				sortBy: (input.sortBy as 'createdAt' | 'type') || 'createdAt',
				sortOrder: input.sortOrder || 'desc'
			}),
			notificationRepository.countByUserId(userIdNum)
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
		console.error('Error fetching notifications:', error);
		return {
			success: false as const,
			error: 'Failed to fetch notifications',
			data: [],
			pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
		};
	}
});
