import { command } from '$app/server';
import * as v from 'valibot';
import { userRepository, groupRepository, roleRepository } from '$lib/server/database/repositories';
import type { UserListItem } from '$lib/server/database/repositories';
import { validatePaginationParams } from '$lib/server/utils/database';

const fetchUsersSchema = v.object({
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc'])),
	isActive: v.optional(v.boolean()),
	providerId: v.optional(v.array(v.string())),
	search: v.optional(v.string())
});

export type FetchUsersInput = v.InferOutput<typeof fetchUsersSchema>;

export const fetchUsers = command(fetchUsersSchema, async (input) => {
	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);

		const filterParams = {
			isActive: input.isActive,
			providerId: input.providerId,
			search: input.search
		};

		const [rows, totalCount] = await Promise.all([
			userRepository.findManyPaginated({
				limit,
				offset,
				sortBy: (input.sortBy as 'name' | 'createdAt') || 'createdAt',
				sortOrder: input.sortOrder || 'asc',
				...filterParams
			}),
			userRepository.countAll(filterParams)
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
		console.error('Error fetching users:', error);
		return {
			success: false as const,
			error: 'Failed to fetch users',
			data: [] as UserListItem[],
			pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
		};
	}
});

const fetchUserSchema = v.object({
	id: v.pipe(v.number(), v.minValue(1))
});

export const fetchUser = command(fetchUserSchema, async (input) => {
	try {
		const result = await userRepository.findByIdWithGroupsAndRoles(input.id);

		if (!result) {
			return {
				success: false as const,
				error: 'User not found',
				data: null
			};
		}

		return {
			success: true as const,
			data: result
		};
	} catch (error) {
		console.error('Error fetching user:', error);
		return {
			success: false as const,
			error: 'Failed to fetch user',
			data: null
		};
	}
});

const fetchAvailableGroupsSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1))
});

export type FetchAvailableGroupsInput = v.InferOutput<typeof fetchAvailableGroupsSchema>;

export const fetchAvailableGroups = command(fetchAvailableGroupsSchema, async (input) => {
	try {
		const availableGroups = await groupRepository.findGroupsNotForUser(input.userId);

		return {
			success: true as const,
			data: availableGroups
		};
	} catch (error) {
		console.error('Error fetching available groups:', error);
		return {
			success: false as const,
			error: 'Failed to fetch available groups',
			data: []
		};
	}
});

const fetchAvailableRolesSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1))
});

export type FetchAvailableRolesInput = v.InferOutput<typeof fetchAvailableRolesSchema>;

export const fetchAvailableRoles = command(fetchAvailableRolesSchema, async (input) => {
	try {
		const availableRoles = await roleRepository.findRolesNotForUser(input.userId);

		return {
			success: true as const,
			data: availableRoles
		};
	} catch (error) {
		console.error('Error fetching available roles:', error);
		return {
			success: false as const,
			error: 'Failed to fetch available roles',
			data: []
		};
	}
});

const addUserToGroupSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1)),
	groupId: v.pipe(v.number(), v.minValue(1))
});

export type AddUserToGroupInput = v.InferOutput<typeof addUserToGroupSchema>;

export const addUserToGroup = command(addUserToGroupSchema, async (input) => {
	try {
		await groupRepository.addUserToGroup(input.userId, input.groupId);

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error adding user to group:', error);
		return {
			success: false as const,
			error: 'Failed to add user to group'
		};
	}
});

const removeUserFromGroupSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1)),
	groupId: v.pipe(v.number(), v.minValue(1))
});

export type RemoveUserFromGroupInput = v.InferOutput<typeof removeUserFromGroupSchema>;

export const removeUserFromGroup = command(removeUserFromGroupSchema, async (input) => {
	try {
		await groupRepository.removeUserFromGroup(input.userId, input.groupId);

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error removing user from group:', error);
		return {
			success: false as const,
			error: 'Failed to remove user from group'
		};
	}
});

const addUserToRoleSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1)),
	roleId: v.pipe(v.number(), v.minValue(1))
});

export type AddUserToRoleInput = v.InferOutput<typeof addUserToRoleSchema>;

export const addUserToRole = command(addUserToRoleSchema, async (input) => {
	try {
		await roleRepository.addUserToRole(input.userId, input.roleId);

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error adding user to role:', error);
		return {
			success: false as const,
			error: 'Failed to add user to role'
		};
	}
});

const removeUserFromRoleSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1)),
	roleId: v.pipe(v.number(), v.minValue(1))
});

export type RemoveUserFromRoleInput = v.InferOutput<typeof removeUserFromRoleSchema>;

export const removeUserFromRole = command(removeUserFromRoleSchema, async (input) => {
	try {
		await roleRepository.removeUserFromRole(input.userId, input.roleId);

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error removing user from role:', error);
		return {
			success: false as const,
			error: 'Failed to remove user from role'
		};
	}
});

const setUserActiveStatusSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1)),
	isActive: v.boolean()
});

export type SetUserActiveStatusInput = v.InferOutput<typeof setUserActiveStatusSchema>;

export const setUserActiveStatus = command(setUserActiveStatusSchema, async (input) => {
	try {
		const result = await userRepository.setUserActiveStatus(input.userId, input.isActive);

		if (!result.success) {
			return {
				success: false as const,
				error: result.error || 'Failed to update user active status'
			};
		}

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error setting user active status:', error);
		return {
			success: false as const,
			error: 'Failed to update user active status'
		};
	}
});
