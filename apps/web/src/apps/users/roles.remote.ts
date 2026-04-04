import { command } from '$app/server';
import * as v from 'valibot';
import { roleRepository } from '$lib/server/database/repositories';
import { validatePaginationParams } from '$lib/server/utils/database';
import { activityLogService } from '$lib/server/activity-log/service';

const createRoleSchema = v.object({
	name: v.pipe(v.string(), v.minLength(1)),
	description: v.optional(v.string()),
	locale: v.pipe(v.string(), v.minLength(2))
});

export const createRole = command(createRoleSchema, async (input) => {
	try {
		const nameObj = { [input.locale]: input.name } as {
			hu: string;
			en: string;
			[key: string]: string;
		};
		const descObj = input.description
			? ({ [input.locale]: input.description } as {
					hu?: string;
					en?: string;
					[key: string]: string | undefined;
				})
			: undefined;

		const role = await roleRepository.create({ name: nameObj, description: descObj });

		activityLogService.log({
			actionKey: 'role.created',
			resourceType: 'role',
			resourceId: String(role.id),
			context: { name: input.name }
		});

		return { success: true as const, data: role };
	} catch (error) {
		console.error('Error creating role:', error);
		return { success: false as const, error: 'Failed to create role' };
	}
});

const updateRoleSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1)),
	name: v.pipe(v.string(), v.minLength(1)),
	description: v.optional(v.string()),
	locale: v.pipe(v.string(), v.minLength(2))
});

export const updateRole = command(updateRoleSchema, async (input) => {
	try {
		const existing = await roleRepository.findById(input.roleId);
		if (!existing) {
			return { success: false as const, error: 'Role not found' };
		}

		const nameObj = {
			...(typeof existing.name === 'object' ? existing.name : {}),
			[input.locale]: input.name
		} as { hu: string; en: string; [key: string]: string };

		const existingDesc =
			existing.description && typeof existing.description === 'object' ? existing.description : {};
		const descObj = input.description
			? ({
					...existingDesc,
					[input.locale]: input.description
				} as { hu?: string; en?: string; [key: string]: string | undefined })
			: existingDesc && Object.keys(existingDesc).length > 0
				? (existingDesc as { hu?: string; en?: string; [key: string]: string | undefined })
				: undefined;

		const role = await roleRepository.update(input.roleId, { name: nameObj, description: descObj });
		return { success: true as const, data: role };
	} catch (error) {
		console.error('Error updating role:', error);
		return { success: false as const, error: 'Failed to update role' };
	}
});

const fetchRolesSchema = v.object({
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export type FetchRolesInput = v.InferOutput<typeof fetchRolesSchema>;

export const fetchRoles = command(fetchRolesSchema, async (input) => {
	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);

		const [rows, totalCount] = await Promise.all([
			roleRepository.findManyPaginated({
				limit,
				offset,
				sortBy: (input.sortBy as 'name' | 'createdAt') || 'createdAt',
				sortOrder: input.sortOrder || 'asc'
			}),
			roleRepository.countAll()
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
		console.error('Error fetching roles:', error);
		return {
			success: false as const,
			error: 'Failed to fetch roles',
			data: [],
			pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
		};
	}
});

const fetchRoleSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const fetchRole = command(fetchRoleSchema, async (input) => {
	try {
		const role = await roleRepository.findById(input.roleId);
		if (!role) {
			return { success: false as const, error: 'Role not found' };
		}
		return { success: true as const, data: { role } };
	} catch (error) {
		console.error('Error fetching role:', error);
		return { success: false as const, error: 'Failed to fetch role' };
	}
});

const fetchRolePermissionsSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1)),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 10),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export const fetchRolePermissions = command(fetchRolePermissionsSchema, async (input) => {
	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);
		const [rows, totalCount] = await Promise.all([
			roleRepository.findPermissionsForRolePaginated(input.roleId, {
				limit,
				offset,
				sortBy: (input.sortBy as 'name' | 'createdAt') || 'name',
				sortOrder: input.sortOrder || 'asc'
			}),
			roleRepository.countPermissionsForRole(input.roleId)
		]);
		return {
			success: true as const,
			data: rows,
			pagination: { page, pageSize: limit, totalCount, totalPages: Math.ceil(totalCount / limit) }
		};
	} catch (error) {
		console.error('Error fetching role permissions:', error);
		return {
			success: false as const,
			error: 'Failed to fetch role permissions',
			data: [],
			pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 }
		};
	}
});

const fetchRoleUsersSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1)),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 10),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export const fetchRoleUsers = command(fetchRoleUsersSchema, async (input) => {
	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);
		const [rows, totalCount] = await Promise.all([
			roleRepository.findUsersForRolePaginated(input.roleId, {
				limit,
				offset,
				sortBy: (input.sortBy as 'name' | 'createdAt') || 'name',
				sortOrder: input.sortOrder || 'asc'
			}),
			roleRepository.countUsersForRole(input.roleId)
		]);
		return {
			success: true as const,
			data: rows,
			pagination: { page, pageSize: limit, totalCount, totalPages: Math.ceil(totalCount / limit) }
		};
	} catch (error) {
		console.error('Error fetching role users:', error);
		return {
			success: false as const,
			error: 'Failed to fetch role users',
			data: [],
			pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 }
		};
	}
});

const fetchAvailablePermissionsSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const fetchAvailablePermissions = command(fetchAvailablePermissionsSchema, async (input) => {
	try {
		const availablePermissions = await roleRepository.findPermissionsNotForRole(input.roleId);

		return {
			success: true as const,
			data: availablePermissions
		};
	} catch (error) {
		console.error('Error fetching available permissions:', error);
		return {
			success: false as const,
			error: 'Failed to fetch available permissions',
			data: []
		};
	}
});

const addPermissionToRoleSchema = v.object({
	permissionId: v.pipe(v.number(), v.minValue(1)),
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const addPermissionToRole = command(addPermissionToRoleSchema, async (input) => {
	try {
		await roleRepository.addPermissionToRole(input.permissionId, input.roleId);

		activityLogService.log({
			actionKey: 'role.permission.added',
			resourceType: 'role',
			resourceId: String(input.roleId),
			context: { permissionId: input.permissionId }
		});

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error adding permission to role:', error);
		return {
			success: false as const,
			error: 'Failed to add permission to role'
		};
	}
});

const removePermissionFromRoleSchema = v.object({
	permissionId: v.pipe(v.number(), v.minValue(1)),
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const removePermissionFromRole = command(removePermissionFromRoleSchema, async (input) => {
	try {
		await roleRepository.removePermissionFromRole(input.permissionId, input.roleId);

		activityLogService.log({
			actionKey: 'role.permission.removed',
			resourceType: 'role',
			resourceId: String(input.roleId),
			context: { permissionId: input.permissionId }
		});

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error removing permission from role:', error);
		return {
			success: false as const,
			error: 'Failed to remove permission from role'
		};
	}
});

const fetchAvailableUsersForRoleSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const fetchAvailableUsersForRole = command(
	fetchAvailableUsersForRoleSchema,
	async (input) => {
		try {
			const availableUsers = await roleRepository.findUsersNotInRole(input.roleId);

			return {
				success: true as const,
				data: availableUsers
			};
		} catch (error) {
			console.error('Error fetching available users for role:', error);
			return {
				success: false as const,
				error: 'Failed to fetch available users',
				data: []
			};
		}
	}
);

const addUserToRoleSchema = v.object({
	userId: v.pipe(v.number(), v.minValue(1)),
	roleId: v.pipe(v.number(), v.minValue(1))
});

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

const deleteRoleSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const deleteRole = command(deleteRoleSchema, async (input) => {
	try {
		await roleRepository.delete(input.roleId);

		activityLogService.log({
			actionKey: 'role.deleted',
			resourceType: 'role',
			resourceId: String(input.roleId)
		});

		return { success: true as const };
	} catch (error) {
		console.error('Error deleting role:', error);
		return { success: false as const, error: 'Failed to delete role' };
	}
});

// --- App kezelés ---

const fetchRoleAppsSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1)),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 10),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export const fetchRoleApps = command(fetchRoleAppsSchema, async (input) => {
	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);
		const [rows, totalCount] = await Promise.all([
			roleRepository.findAppsForRolePaginated(input.roleId, {
				limit,
				offset,
				sortBy: (input.sortBy as 'name' | 'createdAt') || 'name',
				sortOrder: input.sortOrder || 'asc'
			}),
			roleRepository.countAppsForRole(input.roleId)
		]);
		return {
			success: true as const,
			data: rows,
			pagination: { page, pageSize: limit, totalCount, totalPages: Math.ceil(totalCount / limit) }
		};
	} catch (error) {
		console.error('Error fetching role apps:', error);
		return {
			success: false as const,
			error: 'Failed to fetch role apps',
			data: [],
			pagination: { page: 1, pageSize: 10, totalCount: 0, totalPages: 0 }
		};
	}
});

const fetchAvailableAppsForRoleSchema = v.object({
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const fetchAvailableAppsForRole = command(fetchAvailableAppsForRoleSchema, async (input) => {
	try {
		const availableApps = await roleRepository.findAppsNotForRole(input.roleId);

		return {
			success: true as const,
			data: availableApps
		};
	} catch (error) {
		console.error('Error fetching available apps for role:', error);
		return {
			success: false as const,
			error: 'Failed to fetch available apps',
			data: []
		};
	}
});

const addAppToRoleSchema = v.object({
	appId: v.pipe(v.number(), v.minValue(1)),
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const addAppToRole = command(addAppToRoleSchema, async (input) => {
	try {
		await roleRepository.addAppToRole(input.appId, input.roleId);

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error adding app to role:', error);
		return {
			success: false as const,
			error: 'Failed to add app to role'
		};
	}
});

const removeAppFromRoleSchema = v.object({
	appId: v.pipe(v.number(), v.minValue(1)),
	roleId: v.pipe(v.number(), v.minValue(1))
});

export const removeAppFromRole = command(removeAppFromRoleSchema, async (input) => {
	try {
		await roleRepository.removeAppFromRole(input.appId, input.roleId);

		return {
			success: true as const
		};
	} catch (error) {
		console.error('Error removing app from role:', error);
		return {
			success: false as const,
			error: 'Failed to remove app from role'
		};
	}
});
