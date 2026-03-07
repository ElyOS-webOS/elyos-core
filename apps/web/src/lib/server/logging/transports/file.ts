import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { LogEntry, LogTransport } from '../types';
import { serialize } from '../serializer';

export function getLogFilePath(logDir: string, date: Date = new Date()): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	return join(logDir, `error-${yyyy}-${mm}-${dd}.log`);
}

export class FileTransport implements LogTransport {
	name = 'file';

	private logDir: string;
	private dirEnsured = false;

	constructor(logDir: string) {
		this.logDir = logDir;
	}

	private ensureDir(): void {
		if (this.dirEnsured) return;
		try {
			if (!existsSync(this.logDir)) {
				mkdirSync(this.logDir, { recursive: true });
			}
			this.dirEnsured = true;
		} catch (err) {
			console.error(`[FileTransport] Failed to create log directory: ${this.logDir}`, err);
		}
	}

	async write(entry: LogEntry): Promise<void> {
		try {
			this.ensureDir();
			const filePath = getLogFilePath(this.logDir);
			const line = serialize(entry) + '\n';

			// Use Node.js fs API instead of Bun-specific API for better compatibility
			const { appendFile } = await import('node:fs/promises');
			await appendFile(filePath, line, 'utf-8');
		} catch (err) {
			console.error('[FileTransport] Failed to write log entry:', err);
		}
	}
}
