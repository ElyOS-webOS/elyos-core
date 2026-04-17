import { exec } from 'child_process';
import { promisify } from 'util';
import { Pool } from 'pg';
import * as path from 'path';
import drizzleConfig from '../../drizzle.config';
import { extensions } from './config';

// Get schemas from drizzle config (filter out 'public' as it exists by default)
const schemas = (drizzleConfig.schemaFilter as string[])?.filter((s) => s !== 'public') ?? [];

const execAsync = promisify(exec);

const DOCKER_COMPOSE_FILE = path.join(__dirname, '../../../../docker/docker-compose.yml');
const ENV_FILE = path.join(__dirname, '../../../../.env.local');
const VOLUME_NAME = 'docker_racona-data';

/**
 * Execute a shell command and log output.
 */
async function run(command: string, description: string): Promise<void> {
	console.log(`   ⏳ ${description}...`);
	try {
		const { stdout, stderr } = await execAsync(command);
		if (stdout.trim()) console.log(`      ${stdout.trim()}`);
		if (stderr.trim() && !stderr.includes('Warning')) console.log(`      ${stderr.trim()}`);
		console.log(`   ✓ ${description}`);
	} catch (error) {
		const err = error as Error & { stderr?: string };
		// Some docker commands return non-zero but are fine (e.g., volume not found)
		if (err.stderr?.toLowerCase().includes('no such volume') || err.stderr?.includes('not found')) {
			console.log(`   - ${description} (skipped, not found)`);
			return;
		}
		throw error;
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
 * Wait for PostgreSQL to be ready.
 */
async function waitForPostgres(maxAttempts = 60, delayMs = 1000): Promise<void> {
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
 * Run Drizzle migrations.
 */
async function runMigrations(): Promise<void> {
	console.log('   ⏳ Running Drizzle migrations...');
	await execAsync('bun run db:migrate', { cwd: path.join(__dirname, '../../../..') });
	console.log('   ✓ Migrations completed');
}

/**
 * Run seed script.
 */
async function runSeeds(): Promise<void> {
	const runnerModule = await import('./runner');
	await runnerModule.truncateTables();
	await runnerModule.runSeeds();
	await runnerModule.runProcedures();
	await runnerModule.applyAdminEmail();
}

/**
 * Main reset function.
 */
async function main(): Promise<void> {
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('        Database Reset');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('');

	try {
		// Step 1: Stop Docker containers
		console.log('🐳 Stopping Docker containers...');
		await run(`docker compose -f "${DOCKER_COMPOSE_FILE}" down`, 'Containers stopped');
		console.log('');

		// Step 2: Remove Docker volume
		console.log('🗑️  Removing database volume...');
		await run(`docker volume rm ${VOLUME_NAME}`, 'Volume removed');
		console.log('');

		// Step 3: Start Docker containers
		console.log('🚀 Starting Docker containers...');
		await run(
			`docker compose -f "${DOCKER_COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d`,
			'Containers started'
		);
		console.log('');

		// Step 4: Wait for PostgreSQL
		console.log('🔌 Connecting to PostgreSQL...');
		await waitForPostgres();
		console.log('');

		// Step 5: Create schemas
		console.log('🏗️  Creating database schemas...');
		await createSchemas();
		console.log('');

		// Step 6: Enable extensions
		console.log('🔌 Enabling PostgreSQL extensions...');
		await enableExtensions();
		console.log('');

		// Step 7: Run migrations
		console.log('📦 Applying database schema...');
		await runMigrations();
		console.log('');

		// Step 8: Run seeds
		console.log('🌱 Seeding database...');
		await runSeeds();

		console.log('');
		console.log('🎉 Database reset completed successfully!');
	} catch (error) {
		console.error('\n❌ Reset failed:', error);
		process.exit(1);
	}
}

main();
