import { env } from '$lib/env';
import type { LogEntry, LogLevel, LogTransport } from './types';
import { LOG_LEVEL_PRIORITY } from './types';
import { createLogConfig, type LogConfig } from './config';
import { ConsoleTransport, FileTransport, DatabaseTransport } from './transports';

export class Logger {
	private transports: LogTransport[];
	private minLevel: LogLevel;

	constructor(config: LogConfig) {
		this.minLevel = config.level;
		this.transports = [];

		for (const target of config.targets) {
			switch (target) {
				case 'console':
					this.transports.push(new ConsoleTransport());
					break;
				case 'file':
					this.transports.push(new FileTransport(config.logDir));
					break;
				case 'database':
					this.transports.push(new DatabaseTransport());
					break;
			}
		}
	}

	private shouldLog(level: LogLevel): boolean {
		return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
	}

	private createEntry(
		level: LogLevel,
		message: string,
		context?: Partial<Omit<LogEntry, 'id' | 'level' | 'message' | 'timestamp'>>
	): LogEntry {
		return {
			id: crypto.randomUUID(),
			level,
			message,
			source: context?.source ?? 'server',
			timestamp: new Date().toISOString(),
			...context
		};
	}

	async log(
		level: LogLevel,
		message: string,
		context?: Partial<Omit<LogEntry, 'id' | 'level' | 'message' | 'timestamp'>>
	): Promise<void> {
		if (!this.shouldLog(level)) return;

		const entry = this.createEntry(level, message, context);

		const results = await Promise.allSettled(this.transports.map((t) => t.write(entry)));

		for (const result of results) {
			if (result.status === 'rejected') {
				console.error('[Logger] Transport error:', result.reason);
			}
		}
	}

	async debug(
		message: string,
		context?: Partial<Omit<LogEntry, 'id' | 'level' | 'message' | 'timestamp'>>
	): Promise<void> {
		return this.log('debug', message, context);
	}

	async info(
		message: string,
		context?: Partial<Omit<LogEntry, 'id' | 'level' | 'message' | 'timestamp'>>
	): Promise<void> {
		return this.log('info', message, context);
	}

	async warn(
		message: string,
		context?: Partial<Omit<LogEntry, 'id' | 'level' | 'message' | 'timestamp'>>
	): Promise<void> {
		return this.log('warn', message, context);
	}

	async error(
		message: string,
		context?: Partial<Omit<LogEntry, 'id' | 'level' | 'message' | 'timestamp'>>
	): Promise<void> {
		return this.log('error', message, context);
	}

	async fatal(
		message: string,
		context?: Partial<Omit<LogEntry, 'id' | 'level' | 'message' | 'timestamp'>>
	): Promise<void> {
		return this.log('fatal', message, context);
	}
}

const config = createLogConfig(env.LOG_TARGETS, env.LOG_LEVEL, env.LOG_DIR);
export const logger = new Logger(config);
