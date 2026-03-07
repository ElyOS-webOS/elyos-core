import type { LogEntry, LogTransport } from '../types';

const LEVEL_COLORS: Record<string, string> = {
	debug: '\x1b[36m', // cyan
	info: '\x1b[32m', // green
	warn: '\x1b[33m', // yellow
	error: '\x1b[31m', // red
	fatal: '\x1b[35m' // magenta
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function formatDetailed(entry: LogEntry): string {
	const color = LEVEL_COLORS[entry.level] ?? '';
	const level = entry.level.toUpperCase().padEnd(5);
	const parts = [
		`${color}${BOLD}[${level}]${RESET}`,
		`${entry.timestamp}`,
		`[${entry.source}]`,
		entry.message
	];

	if (entry.url) parts.push(`url=${entry.url}`);
	if (entry.userId) parts.push(`user=${entry.userId}`);
	if (entry.stack) parts.push(`\n${entry.stack}`);
	if (entry.context && Object.keys(entry.context).length > 0) {
		parts.push(`\n${JSON.stringify(entry.context, null, 2)}`);
	}

	return parts.join(' ');
}

function formatCompact(entry: LogEntry): string {
	const level = entry.level.toUpperCase().padEnd(5);
	const parts = [`[${level}]`, entry.timestamp, `[${entry.source}]`, entry.message];

	if (entry.stack) parts.push(`| stack=${entry.stack.split('\n')[0]}`);

	return parts.join(' ');
}

export class ConsoleTransport implements LogTransport {
	name = 'console';

	private isDev: boolean;

	constructor() {
		this.isDev = process.env.NODE_ENV !== 'production';
	}

	async write(entry: LogEntry): Promise<void> {
		const formatted = this.isDev ? formatDetailed(entry) : formatCompact(entry);

		switch (entry.level) {
			case 'debug':
				console.debug(formatted);
				break;
			case 'info':
				console.info(formatted);
				break;
			case 'warn':
				console.warn(formatted);
				break;
			case 'error':
			case 'fatal':
				console.error(formatted);
				break;
		}
	}
}
