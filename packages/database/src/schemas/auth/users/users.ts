import { varchar, boolean, timestamp, serial, jsonb } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';
import { authSchema as schema } from '../schema';

import { createInsertSchema } from 'drizzle-valibot';
import * as v from 'valibot';

export const users = schema.table('users', {
	id: serial('id').primaryKey(),
	name: varchar('full_name', { length: 100 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').default(false),
	twoFactorEnabled: boolean('two_factor_enabled').default(false),
	username: varchar('username', { length: 50 }).unique(),
	image: varchar('image', { length: 255 }),
	oauthImage: varchar('oauth_image', { length: 255 }),
	userSettings: jsonb('user_settings').default('{}'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
	deletedAt: timestamp('deleted_at', { withTimezone: true })
});

// Define reusable field schemas
const emailSchema = v.pipe(v.string(), v.email(), v.minLength(5));
const nameSchema = v.pipe(v.string(), v.minLength(1));
const passwordSchema = v.pipe(v.string(), v.minLength(6));
const imageSchema = v.optional(v.string());
const idSchema = v.pipe(v.number(), v.minValue(1));

const baseSchema = createInsertSchema(users, {
	name: nameSchema,
	email: emailSchema,
	emailVerified: v.optional(v.boolean()),
	username: v.optional(v.string()),
	image: imageSchema
});

const userSchema = v.variant('mode', [
	v.object({
		mode: v.literal('signUp'),
		email: emailSchema,
		password: passwordSchema,
		name: nameSchema
	}),
	v.object({
		mode: v.literal('signIn'),
		email: emailSchema,
		password: passwordSchema
	}),
	v.object({
		mode: v.literal('update'),
		name: nameSchema,
		image: imageSchema,
		id: idSchema
	})
]);

export { userSchema, baseSchema };
export type UserSchema = v.InferInput<typeof userSchema>;
export type UserSelectModel = InferSelectModel<typeof users>;
