import { serial, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { platformSchema as schema } from '../schema';

export const aiProviders = schema.table('ai_providers', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 50 }).unique().notNull(),
	displayName: varchar('display_name', { length: 100 }).notNull(),
	description: text('description'),
	isEnabled: boolean('is_enabled').default(true).notNull(),
	isRecommended: boolean('is_recommended').default(false).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export type AiProvider = InferSelectModel<typeof aiProviders>;
export type AiProviderInsert = InferInsertModel<typeof aiProviders>;
