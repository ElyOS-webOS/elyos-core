import { DatabaseTemplateRepository } from './email-template-repository';
import type { RepositoryConfig, CacheConfig } from '../types/email-templates';

/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG: CacheConfig = {
	defaultTtl: 3600, // 1 hour
	templateByTypeTtl: 3600, // 1 hour
	allActiveTemplatesTtl: 1800, // 30 minutes
	templateByIdTtl: 7200 // 2 hours
};

/**
 * High-performance cache configuration for production
 */
const HIGH_PERFORMANCE_CACHE_CONFIG: CacheConfig = {
	defaultTtl: 7200, // 2 hours
	templateByTypeTtl: 7200, // 2 hours
	allActiveTemplatesTtl: 3600, // 1 hour
	templateByIdTtl: 14400 // 4 hours
};

/**
 * Development cache configuration with shorter TTLs
 */
const DEVELOPMENT_CACHE_CONFIG: CacheConfig = {
	defaultTtl: 300, // 5 minutes
	templateByTypeTtl: 300, // 5 minutes
	allActiveTemplatesTtl: 180, // 3 minutes
	templateByIdTtl: 600 // 10 minutes
};

/**
 * Testing cache configuration with minimal TTLs
 */
const TESTING_CACHE_CONFIG: CacheConfig = {
	defaultTtl: 60, // 1 minute
	templateByTypeTtl: 60, // 1 minute
	allActiveTemplatesTtl: 30, // 30 seconds
	templateByIdTtl: 120 // 2 minutes
};

/**
 * Default repository configuration
 */
const DEFAULT_REPOSITORY_CONFIG: RepositoryConfig = {
	enableCache: true,
	cacheConfig: DEFAULT_CACHE_CONFIG,
	retryAttempts: 3,
	retryDelay: 1000 // 1 second
};

/**
 * Create a configured database template repository instance
 */
export function createDatabaseTemplateRepository(
	config?: Partial<RepositoryConfig>
): DatabaseTemplateRepository {
	const finalConfig: RepositoryConfig = {
		...DEFAULT_REPOSITORY_CONFIG,
		...config,
		cacheConfig: {
			...DEFAULT_CACHE_CONFIG,
			...config?.cacheConfig
		}
	};

	return new DatabaseTemplateRepository(finalConfig);
}

/**
 * Singleton instance for application-wide use
 */
let repositoryInstance: DatabaseTemplateRepository | null = null;

/**
 * Get or create the singleton repository instance
 */
export function getDatabaseTemplateRepository(
	config?: Partial<RepositoryConfig>
): DatabaseTemplateRepository {
	if (!repositoryInstance) {
		repositoryInstance = createDatabaseTemplateRepository(config);
	}
	return repositoryInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetDatabaseTemplateRepository(): void {
	repositoryInstance = null;
}

/**
 * Create a high-performance repository optimized for production
 */
export function createHighPerformanceRepository(): DatabaseTemplateRepository {
	const config: RepositoryConfig = {
		...DEFAULT_REPOSITORY_CONFIG,
		cacheConfig: HIGH_PERFORMANCE_CACHE_CONFIG
	};

	const repository = new DatabaseTemplateRepository(config);

	// Warm up cache for high-performance scenarios
	repository.warmUpCache().catch((error) => {
		console.warn('[TemplateRepositoryFactory] Failed to warm up cache:', error);
	});

	return repository;
}

/**
 * Create a development-optimized repository with shorter cache TTLs
 */
export function createDevelopmentRepository(): DatabaseTemplateRepository {
	const config: RepositoryConfig = {
		...DEFAULT_REPOSITORY_CONFIG,
		cacheConfig: DEVELOPMENT_CACHE_CONFIG
	};

	return new DatabaseTemplateRepository(config);
}

/**
 * Create a testing-optimized repository with minimal cache
 */
export function createTestingRepository(): DatabaseTemplateRepository {
	const config: RepositoryConfig = {
		...DEFAULT_REPOSITORY_CONFIG,
		cacheConfig: TESTING_CACHE_CONFIG
	};

	return new DatabaseTemplateRepository(config);
}

/**
 * Create a repository without caching
 */
export function createNoCacheRepository(): DatabaseTemplateRepository {
	const config: RepositoryConfig = {
		...DEFAULT_REPOSITORY_CONFIG,
		enableCache: false
	};

	return new DatabaseTemplateRepository(config);
}

/**
 * Create a repository based on environment
 */
export function createRepositoryForEnvironment(environment?: string): DatabaseTemplateRepository {
	const env = environment || process.env.NODE_ENV || 'development';

	switch (env.toLowerCase()) {
		case 'production':
			return createHighPerformanceRepository();
		case 'development':
			return createDevelopmentRepository();
		case 'test':
		case 'testing':
			return createTestingRepository();
		default:
			return createDatabaseTemplateRepository();
	}
}
