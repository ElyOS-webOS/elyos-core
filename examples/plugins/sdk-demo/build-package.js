/**
 * Build Package Script
 *
 * Ez a script létrehozza a plugin csomagot.
 * A kiterjesztés a PLUGIN_PACKAGE_EXTENSION környezeti változóból jön (alapértelmezett: elyospkg).
 */

import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// .env fájl betöltése
config({ path: '../../../.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin csomag kiterjesztése környezeti változóból
const PACKAGE_EXTENSION = process.env.PLUGIN_PACKAGE_EXTENSION || 'elyospkg';

async function buildPackage() {
	console.log('🔨 Building SDK Demo app package...\n');

	// Output fájl
	const outputPath = path.join(__dirname, `sdk-demo.${PACKAGE_EXTENSION}`);
	const output = fs.createWriteStream(outputPath);
	const archive = archiver('zip', {
		zlib: { level: 9 } // Maximális tömörítés
	});

	// Hibakezelés
	output.on('close', () => {
		const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
		console.log(`\n✅ Package created successfully!`);
		console.log(`📦 File: ${outputPath}`);
		console.log(`📊 Size: ${sizeInMB} MB`);
		console.log(`📝 Extension: .${PACKAGE_EXTENSION}`);
		console.log(`\n🚀 Ready to upload to ElyOS!`);
	});

	archive.on('error', (err) => {
		throw err;
	});

	archive.on('warning', (err) => {
		if (err.code === 'ENOENT') {
			console.warn('⚠️  Warning:', err);
		} else {
			throw err;
		}
	});

	// Pipe archive data to the file
	archive.pipe(output);

	// Fájlok hozzáadása
	console.log('📁 Adding files to package...\n');

	// 1. manifest.json
	console.log('  ✓ manifest.json');
	archive.file('manifest.json', { name: 'manifest.json' });

	// 2. menu.json (ha létezik)
	if (fs.existsSync('menu.json')) {
		console.log('  ✓ menu.json');
		archive.file('menu.json', { name: 'menu.json' });
	}

	// 3. dist/ könyvtár (build output)
	console.log('  ✓ dist/');
	archive.directory('dist/', 'dist');

	// 4. server/ könyvtár
	console.log('  ✓ server/');
	archive.directory('server/', 'server');

	// 5. locales/ könyvtár
	console.log('  ✓ locales/');
	archive.directory('locales/', 'locales');

	// 6. assets/ könyvtár (ha létezik)
	if (fs.existsSync('assets/')) {
		console.log('  ✓ assets/');
		archive.directory('assets/', 'assets');
	}

	// Finalize the archive
	await archive.finalize();
}

// Ellenőrizzük, hogy a dist/ könyvtár létezik-e
if (!fs.existsSync(path.join(__dirname, 'dist'))) {
	console.error('❌ Error: dist/ directory not found!');
	console.error('   Please run "bun run build" first.\n');
	process.exit(1);
}

// Build package
buildPackage().catch((err) => {
	console.error('❌ Error building package:', err);
	process.exit(1);
});
