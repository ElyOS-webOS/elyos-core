import type { DatabaseEmailTemplate, ITemplateCache, CacheConfig } from '../types/email-templates';
import type { EmailTemplateType } from '../../email/types';

/**
 * Cache key constants
 */
export const CACHE_KEYS = {
	templateByType: (type: EmailTemplateType) => `template:type:${type}`,
	allActiveTemplates: 'templates:active:all',
	templateById: (id: string) => `template:id:${id}`
} as const;

/**
 * In-memory template cache implementation.
 * Uses Map for storage with TTL support.
 */
export class TemplateCache implements ITemplateCache {
	private cache = new Map<string, { data: DatabaseEmailTemplate; expiresAt: number }>();
	private config: CacheConfig;
	private stats = {
		hits: 0,
		misses: 0,
		sets: 0,
		deletes: 0,
		evictions: 0
	};
	private cleanupInterval: NodeJS.Timeout;

	constructor(config: CacheConfig) {
		this.config = config;

		// Clean up expired entries every 5 minutes
		this.cleanupInterval = setInterval(() => this.cleanupExpired(), 5 * 60 * 1000);
	}

	/**
	 * Get a template from cache.
	 * @param key - The cache key to retrieve
	 * @returns The cached template or null if not found/expired
	 */
	async get(key: string): Promise<DatabaseEmailTemplate | null> {
		const entry = this.cache.get(key);

		if (!entry) {
			this.stats.misses++;
			return null;
		}

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			this.stats.misses++;
			this.stats.evictions++;
			return null;
		}

		this.stats.hits++;
		return entry.data;
	}

	/**
	 * Set a template in cache with TTL.
	 * @param key - The cache key
	 * @param template - The template to cache
	 * @param ttl - Time to live in seconds (optional)
	 */
	async set(key: string, template: DatabaseEmailTemplate, ttl?: number): Promise<void> {
		const actualTtl = ttl || this.config.defaultTtl;
		const expiresAt = Date.now() + actualTtl * 1000;

		this.cache.set(key, {
			data: template,
			expiresAt
		});

		this.stats.sets++;
	}

	/**
	 * Delete a template from cache.
	 * @param key - The cache key to delete
	 */
	async delete(key: string): Promise<void> {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this.stats.deletes++;
		}
	}

	/**
	 * Clear all cache entries.
	 */
	async clear(): Promise<void> {
		const size = this.cache.size;
		this.cache.clear();
		this.stats.deletes += size;
		this.resetStats();
	}

	/**
	 * Get multiple templates from cache.
	 * @param keys - Array of cache keys to retrieve
	 * @returns Map of found templates
	 */
	async getMultiple(keys: string[]): Promise<Map<string, DatabaseEmailTemplate>> {
		const result = new Map<string, DatabaseEmailTemplate>();
		const now = Date.now();

		for (const key of keys) {
			const entry = this.cache.get(key);

			if (entry && now <= entry.expiresAt) {
				result.set(key, entry.data);
				this.stats.hits++;
			} else if (entry) {
				// Remove expired entry
				this.cache.delete(key);
				this.stats.misses++;
				this.stats.evictions++;
			} else {
				this.stats.misses++;
			}
		}

		return result;
	}

	/**
	 * Set multiple templates in cache.
	 * @param entries - Map of key-template pairs to cache
	 * @param ttl - Time to live in seconds (optional)
	 */
	async setMultiple(entries: Map<string, DatabaseEmailTemplate>, ttl?: number): Promise<void> {
		const actualTtl = ttl || this.config.defaultTtl;
		const expiresAt = Date.now() + actualTtl * 1000;

		for (const [key, template] of entries) {
			this.cache.set(key, {
				data: template,
				expiresAt
			});
			this.stats.sets++;
		}
	}

	/**
	 * Get cache statistics.
	 * @returns Cache performance and usage statistics
	 */
	getStats(): {
		size: number;
		expired: number;
		hitRate: number;
		missRate: number;
		hits: number;
		misses: number;
		sets: number;
		deletes: number;
		evictions: number;
	} {
		const now = Date.now();
		let expired = 0;

		for (const [, entry] of this.cache) {
			if (now > entry.expiresAt) {
				expired++;
			}
		}

		const totalRequests = this.stats.hits + this.stats.misses;
		const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
		const missRate = totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0;

		return {
			size: this.cache.size,
			expired,
			hitRate: Math.round(hitRate * 100) / 100,
			missRate: Math.round(missRate * 100) / 100,
			hits: this.stats.hits,
			misses: this.stats.misses,
			sets: this.stats.sets,
			deletes: this.stats.deletes,
			evictions: this.stats.evictions
		};
	}

	/**
	 * Check if a key exists in cache and is not expired.
	 * @param key - The cache key to check
	 * @returns True if key exists and is valid
	 */
	async has(key: string): Promise<boolean> {
		const entry = this.cache.get(key);
		if (!entry) {
			return false;
		}

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			this.stats.evictions++;
			return false;
		}

		return true;
	}

	/**
	 * Get all cache keys (excluding expired ones).
	 * @returns Array of valid cache keys
	 */
	async keys(): Promise<string[]> {
		const now = Date.now();
		const validKeys: string[] = [];
		const expiredKeys: string[] = [];

		for (const [key, entry] of this.cache) {
			if (now <= entry.expiresAt) {
				validKeys.push(key);
			} else {
				expiredKeys.push(key);
			}
		}

		// Clean up expired keys
		for (const key of expiredKeys) {
			this.cache.delete(key);
			this.stats.evictions++;
		}

		return validKeys;
	}

	/**
	 * Reset cache statistics.
	 */
	resetStats(): void {
		this.stats = {
			hits: 0,
			misses: 0,
			sets: 0,
			deletes: 0,
			evictions: 0
		};
	}

	/**
	 * Get TTL for a specific key.
	 * @param key - The cache key
	 * @returns Remaining TTL in seconds, or -1 if key doesn't exist
	 */
	async getTtl(key: string): Promise<number> {
		const entry = this.cache.get(key);
		if (!entry) {
			return -1;
		}

		const now = Date.now();
		if (now > entry.expiresAt) {
			this.cache.delete(key);
			this.stats.evictions++;
			return -1;
		}

		return Math.ceil((entry.expiresAt - now) / 1000);
	}

	/**
	 * Extend TTL for a specific key.
	 * @param key - The cache key
	 * @param ttl - New TTL in seconds
	 * @returns True if key was found and TTL extended
	 */
	async extendTtl(key: string, ttl: number): Promise<boolean> {
		const entry = this.cache.get(key);
		if (!entry) {
			return false;
		}

		const now = Date.now();
		if (now > entry.expiresAt) {
			this.cache.delete(key);
			this.stats.evictions++;
			return false;
		}

		// Extend TTL
		entry.expiresAt = now + ttl * 1000;
		return true;
	}

	/**
	 * Destroy the cache and cleanup resources.
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.cache.clear();
		this.resetStats();
	}

	/**
	 * Clean up expired entries.
	 */
	private cleanupExpired(): void {
		const now = Date.now();
		const keysToDelete: string[] = [];

		for (const [key, entry] of this.cache) {
			if (now > entry.expiresAt) {
				keysToDelete.push(key);
			}
		}

		for (const key of keysToDelete) {
			this.cache.delete(key);
			this.stats.evictions++;
		}

		if (keysToDelete.length > 0) {
			console.debug(`[TemplateCache] Cleaned up ${keysToDelete.length} expired entries`);
		}
	}
}
