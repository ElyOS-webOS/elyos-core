import { serial, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { groups } from './groups';
import { permissions } from '../permissions/permissions';

export const groupPermissions = schema.table(
	'group_permissions',
	{
		groupId: serial('group_id').references(() => groups.id, { onDelete: 'cascade' }),
		permissionId: integer('permission_id').references(() => permissions.id, {
			onDelete: 'cascade'
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [primaryKey({ columns: [table.groupId, table.permissionId] })]
);
