import { serial, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const locales = schema.table('locales', {
	id: serial('id').primaryKey(),
	code: varchar('code', { length: 10 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	nativeName: varchar('native_name', { length: 100 }).notNull(),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
