export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
	fatal: 4
};

export interface LogEntry {
	id: string;
	level: LogLevel;
	message: string;
	source: string;
	timestamp: string;
	stack?: string;
	context?: Record<string, unknown>;
	userId?: string;
	url?: string;
	method?: string;
	routeId?: string;
	userAgent?: string;
}

export interface LogTransport {
	name: string;
	write(entry: LogEntry): Promise<void>;
}
