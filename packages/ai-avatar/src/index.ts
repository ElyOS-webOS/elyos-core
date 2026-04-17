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

// Fájlok keresése - elfogadjuk prefix nélküli és prefixes formátumot is
type FileMapping = {
	sourceFile: string; // A ténylegesen megtalált fájl neve
	targetFile: string; // A ZIP-ben használandó fájlnév
	key: string; // Azonosító (cover, sd, hd, manifest)
};

const fileMappings: FileMapping[] = [];

// Cover fájl keresése
const coverOptions = [`${name}_cover.jpg`, 'cover.jpg'];
let coverFound = false;
for (const filename of coverOptions) {
	const fullPath = join(inputDir, filename);
	if (existsSync(fullPath)) {
		fileMappings.push({
			sourceFile: filename,
			targetFile: `${name}_cover.jpg`,
			key: 'cover'
		});
		coverFound = true;
		break;
	}
}
if (!coverFound) {
	console.error(`\x1b[31mHiányzó fájl:\x1b[0m cover.jpg vagy ${name}_cover.jpg (cover)`);
}

// Manifest fájl (mindig manifest.json)
const manifestFile = 'manifest.json';
if (existsSync(join(inputDir, manifestFile))) {
	fileMappings.push({
		sourceFile: manifestFile,
		targetFile: manifestFile,
		key: 'manifest'
	});
} else {
	console.error(`\x1b[31mHiányzó fájl:\x1b[0m manifest.json (manifest)`);
}

// Minőségi szintek alapján hozzáadjuk a modell fájlokat
for (const quality of manifest.availableQualities) {
	const glbOptions = [`${name}_${quality}.glb`, `${quality}.glb`];
	let glbFound = false;
	for (const filename of glbOptions) {
		const fullPath = join(inputDir, filename);
		if (existsSync(fullPath)) {
			fileMappings.push({
				sourceFile: filename,
				targetFile: `${name}_${quality}.glb`,
				key: quality
			});
			glbFound = true;
			break;
		}
	}
	if (!glbFound) {
		console.error(
			`\x1b[31mHiányzó fájl:\x1b[0m ${quality}.glb vagy ${name}_${quality}.glb (${quality})`
		);
	}
}

info(`Elérhető minőségi szintek: ${manifest.availableQualities.join(', ')}`);

// Ellenőrizzük, hogy minden kötelező fájl megvan-e
const expectedFileCount = 2 + manifest.availableQualities.length; // cover + manifest + qualities
if (fileMappings.length !== expectedFileCount) {
	error('Egy vagy több kötelező fájl hiányzik. A csomagolás megszakítva.');
}

// ZIP archívum összeállítása
info('Archívum összeállítása...');

const zip = new JSZip();

for (const mapping of fileMappings) {
	const fullPath = join(inputDir, mapping.sourceFile);
	const content = readFileSync(fullPath);
	// A ZIP-ben a targetFile névvel tároljuk
	zip.file(mapping.targetFile, content);
	if (mapping.sourceFile !== mapping.targetFile) {
		info(`  ${mapping.sourceFile} → ${mapping.targetFile}`);
	}
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
