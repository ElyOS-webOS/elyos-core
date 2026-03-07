import { jsonb, timestamp, serial } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { authSchema as schema } from '../schema';

// Local type definition to avoid circular dependency
type LocalizedText = {
	hu: string;
	en: string;
	[key: string]: string;
};

export const roles = schema.table('roles', {
	id: serial('id').primaryKey(),
	name: jsonb('name').notNull().$type<LocalizedText>(),
	description: jsonb('description').$type<Partial<LocalizedText>>(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export type RoleSelectModel = InferSelectModel<typeof roles>;
