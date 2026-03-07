import { uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const emailLogs = schema.table(
	'email_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		messageId: varchar('message_id', { length: 255 }),
		recipient: varchar('recipient', { length: 255 }).notNull(),
		subject: varchar('subject', { length: 500 }).notNull(),
		templateType: varchar('template_type', { length: 100 }),
		status: varchar('status', { length: 50 }).notNull(),
		errorMessage: text('error_message'),
		sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
		deliveredAt: timestamp('delivered_at', { withTimezone: true }),
		openedAt: timestamp('opened_at', { withTimezone: true }),
		clickedAt: timestamp('clicked_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
	},
	(table) => [
		index('email_logs_recipient_idx').on(table.recipient),
		index('email_logs_status_idx').on(table.status),
		index('email_logs_created_at_idx').on(table.createdAt),
		index('email_logs_message_id_idx').on(table.messageId),
		index('email_logs_recipient_status_idx').on(table.recipient, table.status),
		index('email_logs_status_created_at_idx').on(table.status, table.createdAt)
	]
);
