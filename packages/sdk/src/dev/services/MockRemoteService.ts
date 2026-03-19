/**
 * Mock Remote Service
 *
 * Simulates server calls with configurable handlers.
 */

import type { RemoteService, CallOptions } from '../../types/index.js';

/** Configuration for the mock remote service */
export interface MockRemoteConfig {
	/** Map of function name → handler for simulated server-side calls */
	handlers?: Record<string, (...args: unknown[]) => unknown>;
}

/** Mock Remote service — simulates server-side function calls with configurable handlers. */
export class MockRemoteService implements RemoteService {
	/** Map of function name → handler for simulated server-side calls */
	private handlers: Record<string, (...args: unknown[]) => unknown>;

	/** @param config - Optional handler map for simulated server functions */
	constructor(config?: MockRemoteConfig) {
		this.handlers = config?.handlers ?? {};
	}

	/**
	 * Simulate a server call — invokes the registered handler if one exists, otherwise returns `null`.
	 * @param functionName - Server function name
	 * @param params - Parameters to pass
	 * @returns The handler's return value, or `null`
	 */
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
