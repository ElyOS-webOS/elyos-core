import { serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { platformSchema as schema } from '../schema';

export const messages = schema.table('messages', {
	id: serial('id').primaryKey(),
	conversationId: integer('conversation_id').notNull(),
	senderId: integer('sender_id').notNull(),
	content: text('content').notNull(),
	sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
	readAt: timestamp('read_at', { withTimezone: true }),
	isRead: boolean('is_read').default(false).notNull()
});

export type Message = InferSelectModel<typeof messages>;
