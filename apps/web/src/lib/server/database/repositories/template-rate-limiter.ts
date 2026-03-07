/**
 * Rate limiting configuration for different operations.
 */
export interface RateLimitConfig {
	windowMs: number; // Time window in milliseconds
	maxRequests: number; // Maximum requests per window
	skipSuccessfulRequests?: boolean; // Don't count successful requests
	skipFailedRequests?: boolean; // Don't count failed requests
	keyGenerator?: (identifier: string) => string; // Custom key generator
}

/**
 * Rate limit result interface.
 */
export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetTime: Date;
	totalHits: number;
}

/**
 * Rate limit entry for tracking requests.
 */
interface RateLimitEntry {
	count: number;
	resetTime: number;
	firstRequest: number;
}

/**
 * Template rate limiter for preventing abuse and ensuring fair usage.
 */
export class TemplateRateLimiter {
	private store: Map<string, RateLimitEntry> = new Map();
	private configs: Map<string, RateLimitConfig> = new Map();
	private cleanupInterval: NodeJS.Timeout;

	constructor() {
		// Initialize default rate limit configurations
		this.initializeDefaultConfigs();

		// Start cleanup interval to remove expired entries
		this.cleanupInterval = setInterval(() => {
			this.cleanup();
		}, 60000); // Cleanup every minute
	}

	/**
	 * Initialize default rate limit configurations for different operations.
	 */
	private initializeDefaultConfigs(): void {
		// Template access rate limits
		this.configs.set('template_access', {
			windowMs: 60000, // 1 minute
			maxRequests: 100, // 100 requests per minute per user
			skipSuccessfulRequests: false
		});

		// Template creation rate limits
		this.configs.set('template_create', {
			windowMs: 300000, // 5 minutes
			maxRequests: 10, // 10 creations per 5 minutes per user
			skipSuccessfulRequests: false
		});

		// Template update rate limits
		this.configs.set('template_update', {
			windowMs: 60000, // 1 minute
			maxRequests: 20, // 20 updates per minute per user
			skipSuccessfulRequests: false
		});

		// Template rendering rate limits
		this.configs.set('template_render', {
			windowMs: 60000, // 1 minute
			maxRequests: 200, // 200 renders per minute per user
			skipSuccessfulRequests: true // Don't count successful renders
		});

		// Cache operations rate limits
		this.configs.set('cache_operation', {
			windowMs: 60000, // 1 minute
			maxRequests: 500, // 500 cache operations per minute per user
			skipSuccessfulRequests: true
		});

		// Security validation rate limits (stricter)
		this.configs.set('security_validation', {
			windowMs: 300000, // 5 minutes
			maxRequests: 50, // 50 validations per 5 minutes per user
			skipSuccessfulRequests: false
		});

		// Global rate limit for all template operations
		this.configs.set('global_template', {
			windowMs: 60000, // 1 minute
			maxRequests: 1000, // 1000 total operations per minute per user
			skipSuccessfulRequests: false
		});
	}

	/**
	 * Check if a request is allowed under rate limits.
	 * @param operation - The operation type to check.
	 * @param identifier - The identifier (user ID, IP address, etc.).
	 * @param success - Whether the previous request was successful (for skip logic).
	 * @returns Rate limit result.
	 */
	checkRateLimit(operation: string, identifier: string, success?: boolean): RateLimitResult {
		const config = this.configs.get(operation);
		if (!config) {
			// If no config exists, allow the request
			return {
				allowed: true,
				remaining: Infinity,
				resetTime: new Date(Date.now() + 60000),
				totalHits: 0
			};
		}

		const key = this.generateKey(operation, identifier, config);
		const now = Date.now();
		const windowStart = now - config.windowMs;

		let entry = this.store.get(key);

		// Initialize entry if it doesn't exist or if window has expired
		if (!entry || entry.resetTime <= now) {
			entry = {
				count: 0,
				resetTime: now + config.windowMs,
				firstRequest: now
			};
			this.store.set(key, entry);
		}

		// Check if we should skip this request based on success/failure
		const shouldSkip =
			(success === true && config.skipSuccessfulRequests) ||
			(success === false && config.skipFailedRequests);

		if (!shouldSkip) {
			entry.count++;
		}

		const allowed = entry.count <= config.maxRequests;
		const remaining = Math.max(0, config.maxRequests - entry.count);

		return {
			allowed,
			remaining,
			resetTime: new Date(entry.resetTime),
			totalHits: entry.count
		};
	}

	/**
	 * Check multiple rate limits at once.
	 * @param operations - Array of operations to check.
	 * @param identifier - The identifier for rate limiting.
	 * @param success - Whether the request was successful.
	 * @returns Map of operation to rate limit result.
	 */
	checkMultipleRateLimits(
		operations: string[],
		identifier: string,
		success?: boolean
	): Map<string, RateLimitResult> {
		const results = new Map<string, RateLimitResult>();

		for (const operation of operations) {
			results.set(operation, this.checkRateLimit(operation, identifier, success));
		}

		return results;
	}

	/**
	 * Check if any of the specified operations would be rate limited.
	 * @param operations - Array of operations to check.
	 * @param identifier - The identifier for rate limiting.
	 * @returns True if any operation would be blocked.
	 */
	wouldBeRateLimited(operations: string[], identifier: string): boolean {
		return operations.some((operation) => {
			const result = this.checkRateLimit(operation, identifier);
			return !result.allowed;
		});
	}

	/**
	 * Get current rate limit status for an operation without incrementing counters.
	 * @param operation - The operation type to check.
	 * @param identifier - The identifier for rate limiting.
	 * @returns Current rate limit status.
	 */
	getRateLimitStatus(operation: string, identifier: string): RateLimitResult {
		const config = this.configs.get(operation);
		if (!config) {
			return {
				allowed: true,
				remaining: Infinity,
				resetTime: new Date(Date.now() + 60000),
				totalHits: 0
			};
		}

		const key = this.generateKey(operation, identifier, config);
		const entry = this.store.get(key);

		if (!entry || entry.resetTime <= Date.now()) {
			return {
				allowed: true,
				remaining: config.maxRequests,
				resetTime: new Date(Date.now() + config.windowMs),
				totalHits: 0
			};
		}

		const allowed = entry.count < config.maxRequests;
		const remaining = Math.max(0, config.maxRequests - entry.count);

		return {
			allowed,
			remaining,
			resetTime: new Date(entry.resetTime),
			totalHits: entry.count
		};
	}

	/**
	 * Reset rate limit for a specific operation and identifier.
	 * @param operation - The operation type to reset.
	 * @param identifier - The identifier to reset.
	 */
	resetRateLimit(operation: string, identifier: string): void {
		const config = this.configs.get(operation);
		if (!config) return;

		const key = this.generateKey(operation, identifier, config);
		this.store.delete(key);
	}

	/**
	 * Reset all rate limits for an identifier.
	 * @param identifier - The identifier to reset all limits for.
	 */
	resetAllRateLimits(identifier: string): void {
		const keysToDelete: string[] = [];

		for (const [key] of this.store) {
			if (key.includes(identifier)) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => this.store.delete(key));
	}

	/**
	 * Add or update a rate limit configuration.
	 * @param operation - The operation name.
	 * @param config - The rate limit configuration.
	 */
	setRateLimitConfig(operation: string, config: RateLimitConfig): void {
		this.configs.set(operation, config);
	}

	/**
	 * Get rate limit configuration for an operation.
	 * @param operation - The operation name.
	 * @returns The rate limit configuration or undefined.
	 */
	getRateLimitConfig(operation: string): RateLimitConfig | undefined {
		return this.configs.get(operation);
	}

	/**
	 * Get all current rate limit configurations.
	 * @returns Map of operation to configuration.
	 */
	getAllConfigs(): Map<string, RateLimitConfig> {
		return new Map(this.configs);
	}

	/**
	 * Get statistics about current rate limit usage.
	 * @returns Statistics object.
	 */
	getStatistics(): {
		totalEntries: number;
		activeWindows: number;
		expiredEntries: number;
		operationCounts: Map<string, number>;
	} {
		const now = Date.now();
		let activeWindows = 0;
		let expiredEntries = 0;
		const operationCounts = new Map<string, number>();

		for (const [key, entry] of this.store) {
			if (entry.resetTime > now) {
				activeWindows++;
			} else {
				expiredEntries++;
			}

			// Extract operation from key
			const operation = key.split(':')[0];
			operationCounts.set(operation, (operationCounts.get(operation) || 0) + 1);
		}

		return {
			totalEntries: this.store.size,
			activeWindows,
			expiredEntries,
			operationCounts
		};
	}

	/**
	 * Get rate limit entries for debugging purposes.
	 * @param operation - Optional operation to filter by.
	 * @returns Array of rate limit entries with keys.
	 */
	getDebugInfo(operation?: string): Array<{
		key: string;
		entry: RateLimitEntry;
		isExpired: boolean;
	}> {
		const now = Date.now();
		const results: Array<{
			key: string;
			entry: RateLimitEntry;
			isExpired: boolean;
		}> = [];

		for (const [key, entry] of this.store) {
			if (!operation || key.startsWith(operation + ':')) {
				results.push({
					key,
					entry: { ...entry },
					isExpired: entry.resetTime <= now
				});
			}
		}

		return results.sort((a, b) => b.entry.resetTime - a.entry.resetTime);
	}

	/**
	 * Clean up expired rate limit entries.
	 */
	private cleanup(): void {
		const now = Date.now();
		const keysToDelete: string[] = [];

		for (const [key, entry] of this.store) {
			if (entry.resetTime <= now) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach((key) => this.store.delete(key));

		if (keysToDelete.length > 0) {
			console.debug(
				`[TemplateRateLimiter] Cleaned up ${keysToDelete.length} expired rate limit entries`
			);
		}
	}

	/**
	 * Generate a unique key for rate limiting.
	 * @param operation - The operation type.
	 * @param identifier - The identifier.
	 * @param config - The rate limit configuration.
	 * @returns Unique key for the rate limit entry.
	 */
	private generateKey(operation: string, identifier: string, config: RateLimitConfig): string {
		if (config.keyGenerator) {
			return config.keyGenerator(identifier);
		}
		return `${operation}:${identifier}`;
	}

	/**
	 * Destroy the rate limiter and clean up resources.
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
		this.store.clear();
		this.configs.clear();
	}
}
