import { integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { groups } from '../groups/groups';
import { apps } from '../../platform/apps/apps';

export const groupAppAccess = schema.table(
	'group_app_access',
	{
		groupId: integer('group_id')
			.notNull()
			.references(() => groups.id, { onDelete: 'cascade' }),
		appId: integer('app_id')
			.notNull()
			.references(() => apps.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [primaryKey({ columns: [table.groupId, table.appId] })]
);
