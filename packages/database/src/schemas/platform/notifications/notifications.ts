import { pgTable, text, timestamp, integer, boolean, jsonb, pgSchema } from 'drizzle-orm/pg-core';
import { platformSchema as schema } from '../schema';

export const notifications = schema.table('notifications', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	userId: integer('user_id').notNull(),
	appName: text('app_name'), // null = system notification
	title: jsonb('title').notNull(), // { hu: string, en: string, ... }
	message: jsonb('message').notNull(), // { hu: string, en: string, ... }
	details: jsonb('details'), // Optional detailed message { hu: string, en: string, ... }
	type: text('type').notNull().default('info'), // info, success, warning, error, critical
	isRead: boolean('is_read').notNull().default(false),
	data: jsonb('data'), // Extra data for the notification
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	readAt: timestamp('read_at', { withTimezone: true })
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// Helper types for i18n content
export type I18nContent = {
	hu: string;
	en: string;
	[key: string]: string; // Support for additional locales
};

// Extended notification type with typed i18n fields
export type NotificationWithI18n = Omit<Notification, 'title' | 'message' | 'details'> & {
	title: I18nContent;
	message: I18nContent;
	details?: I18nContent | null;
};
