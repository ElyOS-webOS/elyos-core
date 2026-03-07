/**
 * Data Service
 *
 * Plugin adattárolás és adatbázis műveletek.
 * Adatok plugin_{plugin_id} sémában tárolva, más plugin sémák nem elérhetők.
 */

import type { DataService as IDataService, Transaction } from '../../types/index.js';
import { PluginErrorCode } from '../../types/index.js';

export class DataService implements IDataService {
	private readonly pluginId: string;

	constructor(pluginId: string) {
		this.pluginId = pluginId;
	}

	/** Kulcs-érték pár tárolása */
	async set(key: string, value: unknown): Promise<void> {
		await this.apiCall('/set', { key, value });
	}

	/** Kulcs-érték pár lekérdezése */
	async get<T = unknown>(key: string): Promise<T | null> {
		const result = await this.apiCall<{ value: T | null }>('/get', { key });
		return result.value;
	}

	/** Kulcs-érték pár törlése */
	async delete(key: string): Promise<void> {
		await this.apiCall('/delete', { key });
	}

	/** SQL lekérdezés végrehajtása (csak a plugin saját sémájában) */
	async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
		const result = await this.apiCall<{ rows: T[] }>('/query', { sql, params });
		return result.rows;
	}

	/** Tranzakció végrehajtása */
	async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
		const tx: Transaction = {
			query: <R = unknown>(sql: string, params?: unknown[]) => this.query<R>(sql, params),
			commit: async () => {},
			rollback: async () => {}
		};
		return callback(tx);
	}

	/** API hívás a data service endpoint-hoz */
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
