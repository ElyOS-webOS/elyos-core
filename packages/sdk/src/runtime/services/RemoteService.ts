/**
 * Remote Service
 *
 * Call server-side functions via HTTP POST.
 * Includes retry logic with exponential backoff.
 */

import type { RemoteService as IRemoteService, CallOptions } from '../../types/index.js';
import { PluginErrorCode } from '../../types/index.js';

/** Remote service — call server-side functions via HTTP POST with retry logic. */
export class RemoteService implements IRemoteService {
	/** @internal */
	private readonly pluginId: string;

	/** @param pluginId - Unique plugin identifier */
	constructor(pluginId: string) {
		this.pluginId = pluginId;
	}

	/**
	 * Call a server-side function with retry logic (max 3 attempts, exponential backoff).
	 *
	 * @param functionName - Name of the server-side function
	 * @param params - Parameters to pass
	 * @param options - Call options (e.g. timeout)
	 * @returns The result returned by the server
	 * @throws `REMOTE_CALL_TIMEOUT` if the request exceeds the timeout
	 * @throws `NETWORK_ERROR` if a network error occurs
	 * @throws `SERVER_ERROR` if the server returns a 5xx error
	 * @throws `CLIENT_ERROR` if the server returns a 4xx error
	 */
	async call<T = unknown>(
		functionName: string,
		params?: Record<string, unknown>,
		options?: CallOptions
	): Promise<T> {
		const timeout = options?.timeout ?? 30000;
		const maxRetries = 3;
		let lastError: Error | null = null;

		for (let attempt = 0; attempt < maxRetries; attempt++) {
			try {
				return await this.executeCall<T>(functionName, params, timeout);
			} catch (error) {
				lastError = error as Error;

				// Do not retry non-network errors
				if (
					error instanceof Error &&
					!error.message.includes('network') &&
					!error.message.includes('timeout')
				) {
					throw error;
				}

				// Exponential backoff: 1s, 2s, 4s
				if (attempt < maxRetries - 1) {
					const delay = Math.pow(2, attempt) * 1000;
					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
		}

		throw new Error(
			`${PluginErrorCode.REMOTE_ERROR}: Failed after ${maxRetries} attempts: ${lastError?.message}`
		);
	}

	/** Execute a single remote call */
	private async executeCall<T>(
		functionName: string,
		params: Record<string, unknown> | undefined,
		timeout: number
	): Promise<T> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(`/api/plugins/${this.pluginId}/remote/${functionName}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ params: params ?? {} }),
				signal: controller.signal,
				credentials: 'same-origin'
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				if (response.status >= 500) {
					throw new Error(`${PluginErrorCode.SERVER_ERROR}: Server error (${response.status})`);
				}
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					`${PluginErrorCode.CLIENT_ERROR}: ${(errorData as Record<string, string>).error ?? 'Client error'}`
				);
			}

			const data = (await response.json()) as { success: boolean; error?: string; result: T };

			if (!data.success) {
				throw new Error(`${PluginErrorCode.REMOTE_ERROR}: ${data.error ?? 'Remote call failed'}`);
			}

			return data.result;
		} catch (error) {
			clearTimeout(timeoutId);

			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					throw new Error(
						`${PluginErrorCode.REMOTE_CALL_TIMEOUT}: Request timeout after ${timeout}ms`
					);
				}
				if (error.message.includes('Failed to fetch')) {
					throw new Error(`${PluginErrorCode.NETWORK_ERROR}: Network error`);
				}
			}

			throw error;
		}
	}
}
