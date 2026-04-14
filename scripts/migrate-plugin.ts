#!/usr/bin/env bun
/**
 * Racona Plugin Migration Script
 *
 * Migrates existing plugins from the old SDK (@racona/webos-sdk-types, $lib/sdk)
 * to the new standalone @racona/sdk package.
 *
 * Usage:
 *   bun run scripts/migrate-plugin.ts <plugin-directory>
 *   bun run scripts/migrate-plugin.ts <plugin-directory> --dry-run
 *
 * What it does:
 *   1. Updates package.json (removes old types pkg, adds @racona/sdk)
 *   2. Updates imports in .ts, .js, and .svelte files
 */

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

// ─── Configuration ──────────────────────────────────────────────

const IMPORT_REPLACEMENTS: [RegExp, string][] = [
	// @racona/webos-sdk-types → @racona/sdk/types
	[/@racona\/webos-sdk-types/g, '@racona/sdk/types'],
	// $lib/sdk/services/* → @racona/sdk/types (type imports from internal services)
	[/\$lib\/sdk\/services\/\w+/g, '@racona/sdk/types'],
	// $lib/sdk → @racona/sdk
	[/\$lib\/sdk/g, '@racona/sdk']
];

const SOURCE_EXTENSIONS = new Set(['.ts', '.js', '.svelte']);

const SDK_PACKAGE = '@racona/sdk';
const SDK_VERSION = '^1.0.0';
const OLD_TYPES_PACKAGE = '@racona/webos-sdk-types';

// ─── Types ──────────────────────────────────────────────────────

interface MigrationResult {
	file: string;
	changes: string[];
}

interface PackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	[key: string]: unknown;
}

// ─── Helpers ────────────────────────────────────────────────────

async function getSourceFiles(dir: string): Promise<string[]> {
	const files: string[] = [];

	async function walk(currentDir: string) {
		const entries = await readdir(currentDir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(currentDir, entry.name);

			if (entry.isDirectory()) {
				// Skip node_modules, dist, .git
				if (['node_modules', 'dist', '.git', 'build'].includes(entry.name)) continue;
				await walk(fullPath);
			} else if (entry.isFile()) {
				const ext = entry.name.slice(entry.name.lastIndexOf('.'));
				if (SOURCE_EXTENSIONS.has(ext)) {
					files.push(fullPath);
				}
			}
		}
	}

	await walk(dir);
	return files;
}

function updateImports(content: string): { updated: string; changes: string[] } {
	const changes: string[] = [];
	let updated = content;

	for (const [pattern, replacement] of IMPORT_REPLACEMENTS) {
		const matches = updated.match(pattern);
		if (matches) {
			for (const match of matches) {
				changes.push(`"${match}" → "${replacement}"`);
			}
			updated = updated.replace(pattern, replacement);
		}
	}

	return { updated, changes };
}

// ─── Migration Steps ────────────────────────────────────────────

async function migratePackageJson(
	pluginDir: string,
	dryRun: boolean
): Promise<MigrationResult | null> {
	const pkgPath = join(pluginDir, 'package.json');
	const changes: string[] = [];

	let pkgContent: string;
	try {
		pkgContent = await readFile(pkgPath, 'utf-8');
	} catch {
		console.warn('⚠  No package.json found, skipping package updates');
		return null;
	}

	const pkg: PackageJson = JSON.parse(pkgContent);

	// Remove old types package from devDependencies
	if (pkg.devDependencies?.[OLD_TYPES_PACKAGE]) {
		delete pkg.devDependencies[OLD_TYPES_PACKAGE];
		changes.push(`Removed "${OLD_TYPES_PACKAGE}" from devDependencies`);

		// Clean up empty devDependencies
		if (Object.keys(pkg.devDependencies).length === 0) {
			delete pkg.devDependencies;
		}
	}

	// Remove old types package from dependencies (in case it was there)
	if (pkg.dependencies?.[OLD_TYPES_PACKAGE]) {
		delete pkg.dependencies[OLD_TYPES_PACKAGE];
		changes.push(`Removed "${OLD_TYPES_PACKAGE}" from dependencies`);
	}

	// Add new SDK to dependencies
	if (!pkg.dependencies?.[SDK_PACKAGE]) {
		pkg.dependencies = pkg.dependencies || {};
		pkg.dependencies[SDK_PACKAGE] = SDK_VERSION;
		changes.push(`Added "${SDK_PACKAGE}": "${SDK_VERSION}" to dependencies`);
	}

	if (changes.length > 0 && !dryRun) {
		// Detect indentation style from original file
		const indent = pkgContent.includes('\t') ? '\t' : '  ';
		await writeFile(pkgPath, JSON.stringify(pkg, null, indent) + '\n', 'utf-8');
	}

	return changes.length > 0 ? { file: 'package.json', changes } : null;
}

async function migrateSourceFiles(pluginDir: string, dryRun: boolean): Promise<MigrationResult[]> {
	const results: MigrationResult[] = [];
	const files = await getSourceFiles(pluginDir);

	for (const filePath of files) {
		const content = await readFile(filePath, 'utf-8');
		const { updated, changes } = updateImports(content);

		if (changes.length > 0) {
			const relPath = relative(pluginDir, filePath);
			results.push({ file: relPath, changes });

			if (!dryRun) {
				await writeFile(filePath, updated, 'utf-8');
			}
		}
	}

	return results;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const pluginDir = args.find((a) => !a.startsWith('--'));

	if (!pluginDir) {
		console.error('Usage: bun run scripts/migrate-plugin.ts <plugin-directory> [--dry-run]');
		console.error('');
		console.error('Examples:');
		console.error('  bun run scripts/migrate-plugin.ts examples/plugins/hello-world');
		console.error('  bun run scripts/migrate-plugin.ts ../my-plugin --dry-run');
		process.exit(1);
	}

	// Verify directory exists
	try {
		const stats = await stat(pluginDir);
		if (!stats.isDirectory()) {
			console.error(`Error: "${pluginDir}" is not a directory`);
			process.exit(1);
		}
	} catch {
		console.error(`Error: Directory "${pluginDir}" not found`);
		process.exit(1);
	}

	console.log(`\n🔄 Migrating plugin: ${pluginDir}`);
	if (dryRun) {
		console.log('   (dry run — no files will be modified)\n');
	} else {
		console.log('');
	}

	const allResults: MigrationResult[] = [];

	// Step 1: Migrate package.json
	const pkgResult = await migratePackageJson(pluginDir, dryRun);
	if (pkgResult) allResults.push(pkgResult);

	// Step 2: Migrate source files
	const sourceResults = await migrateSourceFiles(pluginDir, dryRun);
	allResults.push(...sourceResults);

	// Report results
	if (allResults.length === 0) {
		console.log('✅ No changes needed — plugin is already up to date.\n');
		return;
	}

	console.log(`📝 ${dryRun ? 'Changes to be made' : 'Changes made'}:\n`);

	for (const result of allResults) {
		console.log(`  ${result.file}`);
		for (const change of result.changes) {
			console.log(`    → ${change}`);
		}
		console.log('');
	}

	const totalChanges = allResults.reduce((sum, r) => sum + r.changes.length, 0);
	console.log(`   ${allResults.length} file(s), ${totalChanges} change(s)\n`);

	if (dryRun) {
		console.log('   Run without --dry-run to apply changes.\n');
	} else {
		console.log('✅ Migration complete!\n');
		console.log('Next steps:');
		console.log(`  cd ${pluginDir}`);
		console.log('  bun install');
		console.log('  bun dev\n');
	}
}

main().catch((error) => {
	console.error('Migration failed:', error);
	process.exit(1);
});
