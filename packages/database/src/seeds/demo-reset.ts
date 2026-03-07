import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';
import { truncateOrder } from './config';
import { runSeeds, runProcedures } from './runner';

// Load .env file from project root
if (!process.env.DATABASE_URL) {
	config({ path: path.resolve(import.meta.dir, '../../../../.env') });
}

const UPLOADS_DIR = path.resolve(import.meta.dir, '../../../../uploads');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 1
});

/**
 * Truncate all tables in the correct order.
 */
async function truncateTables(): Promise<void> {
	console.log('🗑️  Truncating all tables...');

	for (const table of truncateOrder) {
		try {
			await pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
			console.log(`   ✓ ${table}`);
		} catch {
			console.log(`   - ${table} (skipped)`);
		}
	}

	console.log('✅ Tables truncated\n');
}

/**
 * Parse DEMO_RESET_UPLOADS_KEEP env var into a set of normalized relative paths to skip.
 * Comma-separated, supports subdirectories: "avatars,backgrounds/shared"
 */
function getExtraKeepPaths(): Set<string> {
	const raw = process.env.DEMO_RESET_UPLOADS_KEEP ?? '';
	return new Set(
		raw
			.split(',')
			.map((s) => s.trim().replace(/^\/|\/$/g, '')) // strip leading/trailing slashes
			.filter(Boolean)
	);
}

/**
 * Recursively clear a directory, skipping any paths listed in keepPaths.
 * keepPaths entries are relative to UPLOADS_DIR.
 */
function clearDir(dir: string, keepPaths: Set<string>, relBase: string = ''): number {
	let cleared = 0;

	for (const entry of fs.readdirSync(dir)) {
		const relPath = relBase ? `${relBase}/${entry}` : entry;
		const fullPath = path.join(dir, entry);

		// Always keep these at root level
		if (!relBase && (entry === '.gitkeep' || entry === '.demo-reset.log')) continue;

		// Exact match — skip entirely
		if (keepPaths.has(relPath)) continue;

		// If any keepPath is nested inside this entry, recurse instead of deleting
		const hasNestedKeep = [...keepPaths].some((k) => k.startsWith(relPath + '/'));
		if (hasNestedKeep && fs.statSync(fullPath).isDirectory()) {
			cleared += clearDir(fullPath, keepPaths, relPath);
		} else {
			fs.rmSync(fullPath, { recursive: true, force: true });
			cleared++;
		}
	}

	return cleared;
}

/**
 * Clear the uploads directory.
 */
function clearUploads(): void {
	console.log('📁 Clearing uploads directory...');

	if (!fs.existsSync(UPLOADS_DIR)) {
		console.log('   - Uploads directory not found, skipping');
		return;
	}

	const keepPaths = getExtraKeepPaths();
	if (keepPaths.size > 0) {
		console.log(`   ℹ️  Keeping: ${[...keepPaths].join(', ')}`);
	}

	const cleared = clearDir(UPLOADS_DIR, keepPaths);

	console.log(`   ✓ Cleared ${cleared} item(s) from uploads`);
	console.log('');
}

const RESET_LOG_FILE = path.join(UPLOADS_DIR, '.demo-reset.log');

/**
 * Append a line to the reset log file in the uploads directory.
 */
function writeResetLog(status: 'success' | 'failed', error?: string): void {
	try {
		if (!fs.existsSync(UPLOADS_DIR)) {
			fs.mkdirSync(UPLOADS_DIR, { recursive: true });
		}

		const line = JSON.stringify({
			timestamp: new Date().toISOString(),
			status,
			...(error && { error })
		});

		fs.appendFileSync(RESET_LOG_FILE, line + '\n');
		console.log(`📝 Reset log written to ${RESET_LOG_FILE}`);
	} catch (err) {
		console.error('   ⚠️  Could not write reset log:', err);
	}
}

/**
 * Main demo reset function.
 */
async function main(): Promise<void> {
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log('        Demo Database Reset');
	console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
	console.log(`   ${new Date().toISOString()}`);
	console.log('');

	try {
		// Step 1: Truncate all tables
		await truncateTables();

		// Step 2: Clear uploads (but keep .demo-reset.log)
		clearUploads();

		// Step 3: Re-seed
		console.log('🌱 Re-seeding database...');
		await runSeeds();
		await runProcedures();
		console.log('');

		console.log('🎉 Demo reset completed successfully!');
		writeResetLog('success');
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Unknown error';
		console.error('\n❌ Demo reset failed:', error);
		writeResetLog('failed', msg);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

main();
