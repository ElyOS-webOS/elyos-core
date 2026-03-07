import { Pool } from 'pg';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import drizzleConfig from '../../drizzle.config';
import { extensions } from './config';

const execAsync = promisify(exec);

// Get schemas from drizzle config (filter out 'public' as it exists by default)
const schemas = (drizzleConfig.schemaFilter as string[])?.filter((s) => s !== 'public') ?? [];

/**
 * Wait for PostgreSQL to be ready.
 */
async function waitForPostgres(maxAttempts = 30, delayMs = 1000): Promise<void> {
	console.log('   ⏳ Waiting for PostgreSQL to be ready...');

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 1,
		connectionTimeoutMillis: 2000
	});

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			await pool.query('SELECT 1');
			await pool.end();
			console.log('   ✓ PostgreSQL is ready');
			return;
		} catch {
			if (attempt === maxAttempts) {
				await pool.end();
				throw new Error('PostgreSQL did not become ready in time');
			}
			await new Promise((resolve) => setTimeout(resolve, delayMs));
		}
	}
}

/**
 * Create database schemas if they don't exist.
 */
async function createSchemas(): Promise<void> {
	console.log('   ⏳ Creating database schemas...');

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 1
	});

	try {
		for (const schema of schemas) {
			await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
			console.log(`   ✓ Schema "${schema}" ready`);
		}
	} finally {
		await pool.end();
	}
}

/**
 * Enable PostgreSQL extensions in the 'extensions' schema.
 */
async function enableExtensions(): Promise<void> {
	if (extensions.length === 0) {
		console.log('   - No extensions configured');
		return;
	}

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		max: 1
	});

	try {
		for (const ext of extensions) {
			await pool.query(`CREATE EXTENSION IF NOT EXISTS "${ext}" SCHEMA extensions`);
			console.log(`   ✓ Extension "${ext}" enabled in extensions schema`);
		}
	} finally {
		await pool.end();
	}
}

/**
 * Run Drizzle migrations.
 */
async function runMigrations(): Promise<void> {
	console.log('   ⏳ Running Drizzle migrations...');

	// Change to the database package directory to run migrations
	const dbPackagePath = path.join(__dirname, '../..');
	await execAsync('bun run db:migrate', { cwd: dbPackagePath });

	console.log('   ✓ Migrations completed');
}

/**
/**
 * Run seed script.
 * @param reset - ha true, előbb truncate-eli a táblákat (teljes reset mód)
 */
async function runSeeds(reset = false): Promise<void> {
	console.log('   ⏳ Running seeds...');

	const runnerModule = await import('./runner');

	if (reset) {
		await runnerModule.truncateTables();
	}

	await runnerModule.runSeeds();
	await runnerModule.runProcedures();
	await runnerModule.applyAdminEmail();

	console.log('   ✓ Seeds completed');
}

/**
 * Main init function.
 */
async function main(): Promise<void> {
	const reset = process.argv.includes('--reset');

	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log(reset ? '     Database Reset & Initialization' : '        Database Initialization');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('');

	try {
		// Step 1: Wait for PostgreSQL
		console.log('🔌 Connecting to PostgreSQL...');
		await waitForPostgres();
		console.log('');

		// Step 2: Create schemas
		console.log('🏗️  Creating database schemas...');
		await createSchemas();
		console.log('');

		// Step 3: Enable extensions
		console.log('🔌 Enabling PostgreSQL extensions...');
		await enableExtensions();
		console.log('');

		// Step 4: Run migrations
		console.log('📦 Applying database schema...');
		await runMigrations();
		console.log('');

		// Step 5: Run seeds (reset módban truncate + seed, egyébként idempotens)
		console.log(reset ? '🌱 Resetting and seeding database...' : '🌱 Seeding database...');
		await runSeeds(reset);

		console.log('');
		console.log('🎉 Database initialization completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Initialization failed:', error);
		process.exit(1);
	}
}

main();
