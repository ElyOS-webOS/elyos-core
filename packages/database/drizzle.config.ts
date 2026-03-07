import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import * as path from 'path';

// Load .env from workspace root (only if DATABASE_URL not already set)
if (!process.env.DATABASE_URL) {
	config({ path: path.resolve(__dirname, '../../.env') });
}

export default defineConfig({
	schema: './src/schemas/index.ts',
	out: './drizzle',
	dialect: 'postgresql',
	schemaFilter: ['public', 'auth', 'platform', 'extensions'],
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
