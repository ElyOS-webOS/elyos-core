import { command } from '$app/server';
import * as v from 'valibot';
import { resourceRepository } from '$lib/server/database/repositories';
import { validatePaginationParams } from '$lib/server/utils/database';

const fetchResourcesSchema = v.object({
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export type FetchResourcesInput = v.InferOutput<typeof fetchResourcesSchema>;

export const fetchResources = command(fetchResourcesSchema, async (input) => {
	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);

		const [rows, totalCount] = await Promise.all([
			resourceRepository.findManyPaginated({
				limit,
				offset,
				sortBy: (input.sortBy as 'name' | 'createdAt') || 'createdAt',
				sortOrder: input.sortOrder || 'asc'
			}),
			resourceRepository.countAll()
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
		console.error('Error fetching resources:', error);
		return {
			success: false as const,
			error: 'Failed to fetch resources',
			data: [],
			pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
		};
	}
});
