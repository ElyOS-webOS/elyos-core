import { integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { authSchema as schema } from '../schema';
import { users } from '../users/users';
import { groups } from './groups';

import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const userGroups = schema.table(
	'user_groups',
	{
		userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
		groupId: integer('group_id').references(() => groups.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
	},
	(table) => [primaryKey({ columns: [table.userId, table.groupId] })]
);

const userGroupsSchema = createInsertSchema(userGroups);

export { userGroupsSchema };
export type UserGroupSchema = v.InferInput<typeof userGroupsSchema>;
export type UserGroupSelectModel = InferSelectModel<typeof userGroups>;
