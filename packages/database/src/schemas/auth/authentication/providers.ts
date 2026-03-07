import { serial, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';

export const providers = schema.table('providers', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 50 }).notNull().unique(),
	enabled: boolean('enabled').default(true),
	config: jsonb('config'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
