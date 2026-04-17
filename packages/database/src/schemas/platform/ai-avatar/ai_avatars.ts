import { serial, varchar, text, jsonb, timestamp, unique } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { platformSchema as schema } from '../schema';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

// Avatar minőségi szintek
export type Quality = 'sd' | 'hd';

// Avatar manifest típus (hu/en leírásokkal)
export type AvatarManifest = {
	descriptions: {
		hu: string;
		en: string;
	};
};

// AI avatárok tábla
export const aiAvatars = schema.table(
	'ai_avatars',
	{
		id: serial('id').primaryKey(),
		idname: varchar('idname', { length: 100 }).notNull(),
		displayName: varchar('display_name', { length: 255 }).notNull(),
		manifest: jsonb('manifest').$type<AvatarManifest>().notNull(),
		availableQualities: jsonb('available_qualities').$type<Quality[]>().notNull(),
		installedAt: timestamp('installed_at', { withTimezone: true }).defaultNow().notNull()
	},
	(table) => [unique('ai_avatars_idname_unique').on(table.idname)]
);

// Valibot schema
const insertAiAvatarSchema = createInsertSchema(aiAvatars);

export { insertAiAvatarSchema };
export type InsertAiAvatarSchema = v.InferInput<typeof insertAiAvatarSchema>;
export type AiAvatarSelectModel = InferSelectModel<typeof aiAvatars>;
