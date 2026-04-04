import { uuid, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const activityLogs = schema.table(
	'activity_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		actionKey: varchar('action_key', { length: 255 }).notNull(),
		userId: varchar('user_id', { length: 255 }),
		resourceType: varchar('resource_type', { length: 100 }),
		resourceId: varchar('resource_id', { length: 255 }),
		context: jsonb('context'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('activity_logs_user_id_idx').on(table.userId),
		index('activity_logs_action_key_idx').on(table.actionKey),
		index('activity_logs_created_at_idx').on(table.createdAt)
	]
);
