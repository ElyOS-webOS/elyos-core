import { uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const errorLogs = schema.table(
	'error_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		level: varchar('level', { length: 10 }).notNull(),
		message: text('message').notNull(),
		source: varchar('source', { length: 50 }).notNull(),
		stack: text('stack'),
		context: jsonb('context'),
		userId: varchar('user_id', { length: 255 }),
		url: varchar('url', { length: 2048 }),
		method: varchar('method', { length: 10 }),
		routeId: varchar('route_id', { length: 255 }),
		userAgent: text('user_agent'),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('error_logs_level_idx').on(table.level),
		index('error_logs_source_idx').on(table.source),
		index('error_logs_created_at_idx').on(table.createdAt),
		index('error_logs_level_created_at_idx').on(table.level, table.createdAt)
	]
);
