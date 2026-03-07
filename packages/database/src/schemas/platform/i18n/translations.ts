import { serial, varchar, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const translations = schema.table(
	'translations',
	{
		id: serial('id').primaryKey(),
		locale: varchar('locale', { length: 10 }).notNull(),
		namespace: varchar('namespace', { length: 100 }).notNull(),
		key: varchar('key', { length: 255 }).notNull(),
		value: text('value').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(table) => [uniqueIndex('unique_translation_idx').on(table.locale, table.namespace, table.key)]
);
