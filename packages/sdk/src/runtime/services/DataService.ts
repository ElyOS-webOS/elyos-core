/**
 * Data Service
 *
 * Plugin data storage and database operations.
 * Data is stored in the plugin_{plugin_id} schema — other plugin schemas are not accessible.
 */

import type { DataService as IDataService, Transaction } from '../../types/index.js';
import { PluginErrorCode } from '../../types/index.js';

/** Data service — key-value storage and SQL queries, scoped to the plugin's own schema. */
export class DataService implements IDataService {
	/** @internal */
	private readonly pluginId: string;

	/** @param pluginId - Unique plugin identifier */
	constructor(pluginId: string) {
		this.pluginId = pluginId;
	}

	/**
	 * Store a key-value pair.
	 * @param key - Key to store
	 * @param value - Value to store (must be JSON-serializable)
	 */
	async set(key: string, value: unknown): Promise<void> {
		await this.apiCall('/set', { key, value });
	}

	/**
	 * Retrieve a value by key.
	 * @param key - Key to look up
	 * @returns The stored value, or `null` if not found
	 */
	async get<T = unknown>(key: string): Promise<T | null> {
		const result = await this.apiCall<{ value: T | null }>('/get', { key });
		return result.value;
	}

	/**
	 * Delete a key-value pair.
	 * @param key - Key to delete
	 */
	async delete(key: string): Promise<void> {
		await this.apiCall('/delete', { key });
	}

	/**
	 * Execute a raw SQL query (scoped to the plugin's own schema only).
	 * @param sql - SQL query string
	 * @param params - Query parameters (SQL injection protection)
	 * @returns Query result rows
	 */
	async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
		const result = await this.apiCall<{ rows: T[] }>('/query', { sql, params });
		return result.rows;
	}

	/**
	 * Execute multiple operations in a single transaction.
	 * @param callback - Transaction callback, receives a `Transaction` object
	 * @returns The return value of the callback
	 */
	async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
		const tx: Transaction = {
			query: <R = unknown>(sql: string, params?: unknown[]) => this.query<R>(sql, params),
			commit: async () => {},
			rollback: async () => {}
		};
		return callback(tx);
	}

	/** Internal API call to the data service endpoint */
	private async apiCall<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
		try {
			const response = await fetch(`/api/plugins/${this.pluginId}/data${endpoint}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(data),
				credentials: 'same-origin'
			});

			if (!response.ok) {
				if (response.status >= 500) {
					throw new Error(`${PluginErrorCode.SERVER_ERROR}: Server error`);
				}
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					`${PluginErrorCode.CLIENT_ERROR}: ${(errorData as Record<string, string>).error ?? 'Client error'}`
				);
			}

			const result = (await response.json()) as { success: boolean; error?: string; data: T };

			if (!result.success) {
				throw new Error(`Data operation failed: ${result.error ?? 'Unknown error'}`);
			}

			return result.data;
		} catch (error) {
			if (error instanceof Error && error.message.includes('Failed to fetch')) {
				throw new Error(`${PluginErrorCode.NETWORK_ERROR}: Network error`);
			}
			throw error;
		}
	}
}
