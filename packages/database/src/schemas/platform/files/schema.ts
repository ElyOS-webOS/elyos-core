import { serial, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { platformSchema as schema } from '../schema';
import { users } from '../../auth/users/users';

export const files = schema.table('files', {
	/** Egyedi azonosító */
	id: serial('id').primaryKey(),

	/** UUID a publikus azonosításhoz */
	publicId: varchar('public_id', { length: 36 }).notNull().unique(),

	/** Tárolt fájlnév */
	filename: varchar('filename', { length: 255 }).notNull(),

	/** Eredeti fájlnév */
	originalName: varchar('original_name', { length: 255 }).notNull(),

	/** Kategória */
	category: varchar('category', { length: 100 }).notNull(),

	/** Scope: 'shared' vagy 'user' */
	scope: varchar('scope', { length: 20 }).notNull(),

	/** Tulajdonos user ID (null ha shared) */
	userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),

	/** MIME típus */
	mimeType: varchar('mime_type', { length: 100 }).notNull(),

	/** Fájlméret bájtban */
	size: integer('size').notNull(),

	/** Tárolási útvonal (relatív az uploads mappához) */
	storagePath: text('storage_path').notNull(),

	/** Bélyegkép tárolási útvonala (opcionális) */
	thumbnailPath: text('thumbnail_path'),

	/** Létrehozás időpontja */
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

	/** Módosítás időpontja */
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Típus exportok
export type FileInsertModel = InferInsertModel<typeof files>;
export type FileSelectModel = InferSelectModel<typeof files>;
