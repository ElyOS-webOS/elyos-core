import { integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { users } from '../users/users';
import { roles } from './roles';

export const userRoles = schema.table(
	'user_roles',
	{
		userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
		roleId: integer('role_id').references(() => roles.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [primaryKey({ columns: [table.userId, table.roleId] })]
);
