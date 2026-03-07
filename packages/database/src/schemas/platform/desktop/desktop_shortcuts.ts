import { uuid, varchar, jsonb, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';
import { users } from '../../auth/users/users';

export const desktopShortcuts = schema.table(
	'desktop_shortcuts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		appId: varchar('app_id', { length: 100 }).notNull(),
		position: jsonb('position').$type<{ x: number; y: number }>().notNull(),
		label: varchar('label', { length: 255 }),
		order: integer('order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [
		index('desktop_shortcuts_user_id_idx').on(table.userId),
		index('desktop_shortcuts_app_id_idx').on(table.appId)
	]
);
