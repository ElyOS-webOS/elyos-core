#!/usr/bin/env bun
// AI Avatar Packager — avatar fájlokat .raconapkg archívumba csomagolja

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import JSZip from 'jszip';
import { writeFile, mkdir } from 'node:fs/promises';
import { validateManifest } from './validateManifest.js';

// --- Segédfüggvények ---

function error(msg: string): never {
	console.error(`\x1b[31mHiba:\x1b[0m ${msg}`);
	process.exit(1);
}

function info(msg: string): void {
	console.log(`\x1b[36mInfo:\x1b[0m ${msg}`);
}

function success(msg: string): void {
	console.log(`\x1b[32mSiker:\x1b[0m ${msg}`);
}

// --- Fő logika ---

const name = process.argv[2];

if (!name || name.trim() === '') {
	error(
		'Hiányzó avatar név paraméter.\nHasználat: bun run pack <avatar-neve>\nPélda:     bun run pack fox'
	);
}

// A bemeneti könyvtár a megadott név alapján (relatív az aktuális munkakönyvtárhoz)
const inputDir = resolve(process.cwd(), name);

// Ellenőrizzük, hogy a könyvtár létezik-e
if (!existsSync(inputDir)) {
	error(`A "${name}" könyvtár nem található: ${inputDir}`);
}

info(`Avatar neve: "${name}"`);
info(`Bemeneti könyvtár: ${inputDir}`);

// manifest.json validálása
const manifestPath = join(inputDir, 'manifest.json');
let manifestRaw: unknown;
try {
	manifestRaw = JSON.parse(readFileSync(manifestPath, 'utf-8'));
} catch {
	error('A manifest.json fájl nem olvasható vagy nem érvényes JSON.');
}

const manifestResult = validateManifest(manifestRaw);
if (!manifestResult.valid) {
	console.error('\x1b[31mA manifest.json érvénytelen:\x1b[0m');
	for (const err of manifestResult.errors) {
		console.error(`  - ${err}`);
	}
	process.exit(1);
}

const manifest = manifestResult.manifest!;

// Kötelező fájlok listája a manifest alapján
const requiredFiles: Record<string, string> = {
	cover: `${name}_cover.jpg`,
	manifest: 'manifest.json'
};

// Minőségi szintek alapján hozzáadjuk a modell fájlokat
for (const quality of manifest.availableQualities) {
	requiredFiles[quality] = `${name}_${quality}.glb`;
}

info(`Elérhető minőségi szintek: ${manifest.availableQualities.join(', ')}`);

// Fájlok meglétének ellenőrzése
let hasError = false;
for (const [key, filename] of Object.entries(requiredFiles)) {
	const fullPath = join(inputDir, filename);
	if (!existsSync(fullPath)) {
		console.error(`\x1b[31mHiányzó fájl:\x1b[0m ${filename} (${key})`);
		hasError = true;
	}
}

if (hasError) {
	error('Egy vagy több kötelező fájl hiányzik. A csomagolás megszakítva.');
}

// ZIP archívum összeállítása
info('Archívum összeállítása...');

const zip = new JSZip();

for (const filename of Object.values(requiredFiles)) {
	const fullPath = join(inputDir, filename);
	const content = readFileSync(fullPath);
	zip.file(filename, content);
}

// Kimeneti könyvtár: dist/ a bemeneti könyvtár mellett
const outputDir = join(inputDir, 'dist');
await mkdir(outputDir, { recursive: true });

const outputFilename = `${name}_ai_avatar.raconapkg`;
const outputPath = join(outputDir, outputFilename);

const zipBuffer = await zip.generateAsync({
	type: 'nodebuffer',
	compression: 'DEFLATE',
	compressionOptions: { level: 6 }
});

await writeFile(outputPath, zipBuffer);

success(`Csomag elkészült: ${join('dist', outputFilename)}`);
