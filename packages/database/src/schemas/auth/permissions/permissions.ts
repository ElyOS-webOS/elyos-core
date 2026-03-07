import { serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { resources } from './resources';

export const permissions = schema.table('permissions', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	description: text('description'),
	resourceId: integer('resource_id').references(() => resources.id),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
