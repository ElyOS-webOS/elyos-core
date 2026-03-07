import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './src/lib/server/database/drizzle',
	schema: './src/lib/server/database/schemas/index.ts',
	dialect: 'postgresql',
	schemaFilter: ['public', 'auth', 'platform'],
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
