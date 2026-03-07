import { integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { roles } from '../roles/roles';
import { apps } from '../../platform/apps/apps';

export const roleAppAccess = schema.table(
	'role_app_access',
	{
		roleId: integer('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		appId: integer('app_id')
			.notNull()
			.references(() => apps.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [primaryKey({ columns: [table.roleId, table.appId] })]
);
