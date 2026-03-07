import { serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { platformSchema as schema } from '../schema';

export const conversations = schema.table('conversations', {
	id: serial('id').primaryKey(),
	participant1Id: integer('participant1_id').notNull(),
	participant2Id: integer('participant2_id').notNull(),
	lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export type Conversation = InferSelectModel<typeof conversations>;
