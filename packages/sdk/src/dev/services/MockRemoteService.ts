/**
 * Mock Remote Service
 *
 * Szerver hívások szimulálása konfigurálható handler-ekkel.
 */

import type { RemoteService, CallOptions } from '../../types/index.js';

export interface MockRemoteConfig {
	handlers?: Record<string, (...args: unknown[]) => unknown>;
}

export class MockRemoteService implements RemoteService {
	private handlers: Record<string, (...args: unknown[]) => unknown>;

	constructor(config?: MockRemoteConfig) {
		this.handlers = config?.handlers ?? {};
	}

	async call<T = unknown>(
		functionName: string,
		params?: Record<string, unknown>,
		_options?: CallOptions
	): Promise<T> {
		console.log(`[Mock Remote] ${functionName}`, params);

		const handler = this.handlers[functionName];
		if (handler) {
			return handler(params) as T;
		}

		console.warn(`[Mock Remote] No handler for "${functionName}", returning null`);
		return null as T;
	}
}
