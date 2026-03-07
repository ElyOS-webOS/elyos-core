import type { LogLevel } from './types';
import { LOG_LEVEL_PRIORITY } from './types';

const VALID_TARGETS = ['console', 'file', 'database'] as const;
export type LogTarget = (typeof VALID_TARGETS)[number];

const VALID_LEVELS = Object.keys(LOG_LEVEL_PRIORITY) as LogLevel[];

export interface LogConfig {
	targets: LogTarget[];
	level: LogLevel;
	logDir: string;
}

export function parseLogTargets(raw: string): LogTarget[] {
	const parsed = raw
		.split(',')
		.map((t) => t.trim().toLowerCase())
		.filter((t): t is LogTarget => VALID_TARGETS.includes(t as LogTarget));

	return parsed.length > 0 ? parsed : ['console'];
}

export function parseLogLevel(raw: string): LogLevel {
	const normalized = raw.trim().toLowerCase();
	if (VALID_LEVELS.includes(normalized as LogLevel)) {
		return normalized as LogLevel;
	}
	return 'error';
}

export function createLogConfig(envTargets: string, envLevel: string, envDir: string): LogConfig {
	return {
		targets: parseLogTargets(envTargets),
		level: parseLogLevel(envLevel),
		logDir: envDir || './logs'
	};
}
