import { serial, integer, varchar, unique } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { platformSchema as schema } from '../schema';
import { aiAvatars } from './ai_avatars';
import { users } from '../../auth/users/users';
import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

// Felhasználói avatar konfiguráció tábla
export const userAvatarConfigs = schema.table(
	'user_avatar_configs',
	{
		id: serial('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		avatarIdname: varchar('avatar_idname', { length: 100 })
			.notNull()
			.references(() => aiAvatars.idname, { onDelete: 'restrict' }),
		quality: varchar('quality', { length: 2 }).$type<'sd' | 'hd'>().notNull().default('sd'),
		customName: varchar('custom_name', { length: 255 })
	},
	(table) => [unique('user_avatar_configs_user_id_unique').on(table.userId)]
);

// Valibot schema
const insertUserAvatarConfigSchema = createInsertSchema(userAvatarConfigs);

export { insertUserAvatarConfigSchema };
export type InsertUserAvatarConfigSchema = v.InferInput<typeof insertUserAvatarConfigSchema>;
export type UserAvatarConfigSelectModel = InferSelectModel<typeof userAvatarConfigs>;
