import { text, integer } from 'drizzle-orm/pg-core';
import { authSchema as schema } from '../schema';
import { users } from '../users/users';

const getRandomUUID = () => crypto.randomUUID();

/**
 * Two-factor authentication table
 * Stores 2FA configuration for users
 */
export const twoFactors = schema.table('two_factors', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => getRandomUUID()),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});
