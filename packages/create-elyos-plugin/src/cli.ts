#!/usr/bin/env node
/**
 * create-elyos-plugin CLI
 *
 * Interaktív wizard ElyOS plugin projektek létrehozásához.
 *
 * Használat:
 *   bunx create-elyos-plugin
 *   bunx create-elyos-plugin my-plugin
 *   bunx create-elyos-plugin my-plugin --template basic --no-install
 */

import { Command } from 'commander';
import { runInteractiveWizard } from './prompts.js';
import { generateProject } from './generator.js';
import pc from 'picocolors';

const program = new Command();

program
	.name('create-elyos-plugin')
	.description('Create a new ElyOS plugin project')
	.version('1.0.0')
	.argument('[plugin-name]', 'Plugin name (kebab-case)')
	.option('-t, --template <template>', 'Template: basic, advanced, datatable')
	.option('--no-install', 'Skip dependency installation')
	.action(async (pluginName?: string, options?: { template?: string; install?: boolean }) => {
		console.log();
		console.log(pc.bold(pc.cyan('  🚀 create-elyos-plugin')));
		console.log();

		try {
			const config = await runInteractiveWizard(pluginName, options);
			await generateProject(config);
		} catch (error) {
			if ((error as Error).message?.includes('cancelled')) {
				console.log(pc.yellow('\n  Megszakítva.\n'));
				process.exit(0);
			}
			console.error(pc.red(`\n  Hiba: ${(error as Error).message}\n`));
			process.exit(1);
		}
	});

program.parse();
