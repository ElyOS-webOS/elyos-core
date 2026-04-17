/**
 * AI Agent Configurations Schema
 *
 * Felhasználók AI agent konfigurációi (API kulcsok, modellek, stb.)
 */

import { serial, integer, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { users } from '../../auth';
import { platformSchema as schema } from '../schema';

export const aiAgentConfigs = schema.table('ai_agent_configs', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	provider: varchar('provider', { length: 50 }).notNull(), // gemini, openai, anthropic, stb.
	apiKey: text('api_key').notNull(), // titkosítva tárolva
	modelName: varchar('model_name', { length: 100 }), // opcionális model név
	baseUrl: text('base_url'), // opcionális egyéni endpoint
	maxTokens: integer('max_tokens').default(1000),
	temperature: varchar('temperature', { length: 10 }).default('0.70'), // string formátumban a pontosság miatt
	isActive: boolean('is_active').default(true).notNull(), // csak egy aktív konfiguráció lehet felhasználónként
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export type AiAgentConfigSelectModel = InferSelectModel<typeof aiAgentConfigs>;
export type AiAgentConfigInsertModel = InferInsertModel<typeof aiAgentConfigs>;
