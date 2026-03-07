import { serial, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';

export const resources = schema.table('resources', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	description: text('description'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
