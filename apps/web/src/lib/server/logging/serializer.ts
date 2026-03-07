import type { LogEntry } from './types';

/**
 * Safe JSON stringify that handles circular references.
 * Circular references are replaced with '[Circular]'.
 */
function safeStringify(value: unknown): string {
	const seen = new WeakSet();

	return JSON.stringify(value, (_key, val) => {
		if (typeof val === 'object' && val !== null) {
			if (seen.has(val)) {
				return '[Circular]';
			}
			seen.add(val);
		}
		return val;
	});
}

/**
 * Serialize a LogEntry to a JSON string.
 * Handles circular references in the context field safely.
 */
export function serialize(entry: LogEntry): string {
	return safeStringify(entry);
}

/**
 * Deserialize a JSON string back to a LogEntry.
 */
export function deserialize(json: string): LogEntry {
	return JSON.parse(json) as LogEntry;
}
