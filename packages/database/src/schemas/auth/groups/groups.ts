import { jsonb, timestamp, serial } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { authSchema as schema } from '../schema';

import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

// Local type definition to avoid circular dependency
type LocalizedText = {
	hu: string;
	en: string;
	[key: string]: string;
};

// Local schema definition to avoid circular dependency
const localizedTextSchema = v.intersect([
	v.object({
		hu: v.pipe(v.string(), v.minLength(1)),
		en: v.pipe(v.string(), v.minLength(1))
	}),
	v.record(v.string(), v.string())
]);

export const groups = schema.table('groups', {
	id: serial('id').primaryKey(),
	name: jsonb('name').notNull().$type<LocalizedText>(), // Többnyelvű név
	description: jsonb('description').$type<Partial<LocalizedText>>(), // Opcionális többnyelvű leírás
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

const groupSchema = createInsertSchema(groups, {
	name: localizedTextSchema,
	description: v.optional(
		v.object({
			hu: v.optional(v.pipe(v.string(), v.minLength(1))),
			en: v.optional(v.pipe(v.string(), v.minLength(1)))
		})
	)
});

export { groupSchema };
export type GroupSchema = v.InferInput<typeof groupSchema>;
export type GroupSelectModel = InferSelectModel<typeof groups>;
