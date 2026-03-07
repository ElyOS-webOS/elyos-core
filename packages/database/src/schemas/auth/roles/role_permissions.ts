import { serial, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { roles } from './roles';
import { permissions } from '../permissions/permissions';

export const rolePermissions = schema.table(
	'role_permissions',
	{
		roleId: serial('role_id').references(() => roles.id, { onDelete: 'cascade' }),
		permissionId: integer('permission_id').references(() => permissions.id, {
			onDelete: 'cascade'
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);
