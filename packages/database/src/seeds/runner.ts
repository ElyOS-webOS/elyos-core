import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import {
	seedConfig,
	procedureConfig,
	truncateOrder,
	type SeedDefinition,
	type ProcedureDefinition
} from './config';

// Load .env file from project root
import { config } from 'dotenv';
if (!process.env.DATABASE_URL) {
	config({ path: path.resolve(import.meta.dir, '../../../../.env.local') });
}

console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? '✓ Found' : '✗ Not found');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 1
});

/**
 * Topological sort for dependency resolution.
 * Returns seeds in the correct execution order.
 */
function topologicalSort(seeds: Record<string, SeedDefinition>): string[] {
	const visited = new Set<string>();
	const result: string[] = [];

	function visit(name: string) {
		if (visited.has(name)) return;
		visited.add(name);

		const seed = seeds[name];
		if (!seed) {
			throw new Error(`Unknown seed: ${name}`);
		}

		for (const dep of seed.dependsOn) {
			visit(dep);
		}

		result.push(name);
	}

	for (const name of Object.keys(seeds)) {
		visit(name);
	}

	return result;
}

/**
 * Truncate all tables in the correct order.
 */
async function truncateTables() {
	console.log('\n🗑️  Truncating tables...');

	for (const table of truncateOrder) {
		try {
			await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
			console.log(`   ✓ ${table}`);
		} catch (error) {
			// Table might not exist, skip silently
			console.log(`   - ${table} (skipped)`);
		}
	}

	console.log('✅ Tables truncated\n');
}

/**
 * Execute a single SQL seed file.
 */
async function executeSeedFile(name: string, definition: SeedDefinition) {
	const sqlPath = path.join(__dirname, 'sql', definition.file);

	if (!fs.existsSync(sqlPath)) {
		console.log(`   ⚠️  ${name}: file not found (${definition.file})`);
		return;
	}

	const sql = fs.readFileSync(sqlPath, 'utf-8');

	try {
		await pool.query(sql);
		console.log(`   ✓ ${name}${definition.description ? ` - ${definition.description}` : ''}`);
	} catch (error) {
		console.error(`   ✗ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		throw error;
	}
}

/**
 * Run all seeds in dependency order.
 */
async function runSeeds(seedNames?: string[]) {
	const allSeeds = topologicalSort(seedConfig);
	const seedsToRun = seedNames ? allSeeds.filter((name) => seedNames.includes(name)) : allSeeds;

	console.log('🌱 Running seeds...');

	for (const name of seedsToRun) {
		const definition = seedConfig[name];
		if (definition) {
			await executeSeedFile(name, definition);
		}
	}

	console.log('✅ Seeds completed\n');
}

/**
 * Execute a single stored procedure SQL file.
 */
async function executeProcedureFile(name: string, definition: ProcedureDefinition) {
	const sqlPath = path.join(__dirname, 'procedures', definition.file);

	if (!fs.existsSync(sqlPath)) {
		console.log(`   ⚠️  ${name}: file not found (${definition.file})`);
		return;
	}

	const sql = fs.readFileSync(sqlPath, 'utf-8');

	try {
		await pool.query(sql);
		console.log(`   ✓ ${name}${definition.description ? ` - ${definition.description}` : ''}`);
	} catch (error) {
		console.error(`   ✗ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		throw error;
	}
}

/**
 * Ha az ADMIN_USER_EMAIL env változó meg van adva, frissíti az 1-es id-jű
 * rendszergazda user email címét az adott értékre.
 */
async function applyAdminEmail() {
	const adminEmail = process.env.ADMIN_USER_EMAIL?.trim();
	if (!adminEmail) return;

	console.log(`👤 Admin email beállítása: ${adminEmail}`);
	try {
		await pool.query(
			`UPDATE auth.users SET email = $1 WHERE id = (SELECT id FROM auth.users ORDER BY id ASC LIMIT 1)`,
			[adminEmail]
		);
		console.log(`   ✓ Admin user email frissítve: ${adminEmail}\n`);
	} catch (error) {
		console.error(
			`   ✗ Admin email frissítés sikertelen: ${error instanceof Error ? error.message : 'Ismeretlen hiba'}`
		);
		throw error;
	}
}

/**
 * Run all stored procedures.
 */
async function runProcedures(procedureNames?: string[]) {
	const allProcedures = Object.keys(procedureConfig);
	const proceduresToRun = procedureNames
		? allProcedures.filter((name) => procedureNames.includes(name))
		: allProcedures;

	if (proceduresToRun.length === 0) {
		return;
	}

	console.log('⚙️  Creating stored procedures...');

	for (const name of proceduresToRun) {
		const definition = procedureConfig[name];
		if (definition) {
			await executeProcedureFile(name, definition);
		}
	}

	console.log('✅ Procedures completed\n');
}

/**
 * Main entry point.
 */
async function main() {
	console.log('ok');
	const args = process.argv.slice(2);
	const skipTruncate = args.includes('--no-truncate');
	const onlySeeds = args
		.find((arg) => arg.startsWith('--only='))
		?.split('=')[1]
		?.split(',');
	const onlyProcedures = args
		.find((arg) => arg.startsWith('--only-procedures='))
		?.split('=')[1]
		?.split(',');

	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('        Database Seed Runner');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

	try {
		if (!skipTruncate) {
			await truncateTables();
		}

		await runSeeds(onlySeeds);
		await runProcedures(onlyProcedures);
		await applyAdminEmail();

		console.log('🎉 Seeding completed successfully!');
	} catch (error) {
		console.error('\n❌ Seeding failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

// Export functions for use in init-db.ts
export { runSeeds, runProcedures, truncateTables, applyAdminEmail };

// Only run main if this file is executed directly
const normalizedImportUrl = import.meta.url.replace(/\\/g, '/').replace(/\/\/\//g, '//');
const normalizedArgv = (
	'file://' + process.argv[1]?.replace(/\\/g, '/').replace(/\/\/\//g, '//')
).replace(/\/\/\//g, '//');

console.log(normalizedImportUrl);
console.log(normalizedArgv);

if (normalizedImportUrl === normalizedArgv) {
	main();
}
