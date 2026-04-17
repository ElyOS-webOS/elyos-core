import { serial, integer, varchar, text, boolean, timestamp, unique } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { platformSchema as schema } from '../schema';
import { aiProviders } from './aiProviders';

export const aiProviderConfigs = schema.table(
	'ai_provider_configs',
	{
		id: serial('id').primaryKey(),
		providerId: integer('provider_id')
			.references(() => aiProviders.id)
			.notNull(),
		configKey: varchar('config_key', { length: 100 }).notNull(),
		configValue: text('config_value').notNull(),
		configType: varchar('config_type', { length: 20 }).default('string').notNull(),
		isRequired: boolean('is_required').default(false).notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => ({
		// Unique constraint on provider_id + config_key combination
		providerConfigUnique: unique().on(table.providerId, table.configKey)
	})
);

export type AiProviderConfig = InferSelectModel<typeof aiProviderConfigs>;
export type AiProviderConfigInsert = InferInsertModel<typeof aiProviderConfigs>;
