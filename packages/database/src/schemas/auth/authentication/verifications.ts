import { varchar, timestamp, serial } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';

const verifications = schema.table('verifications', {
	id: serial('id').primaryKey(),
	identifier: varchar('identifier', { length: 255 }).notNull(),
	value: varchar('value', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export { verifications };
