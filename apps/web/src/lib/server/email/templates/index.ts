// Template system exports
export { TemplateEngine } from './engine';
export { TemplateRegistry } from './registry';

// Type exports
export type { EmailTemplate, RenderedTemplate, TemplateData } from './engine';

// Import for factory function
import { TemplateRegistry } from './registry';
import { DatabaseTemplateRepository } from '../../database/repositories/email-template-repository';
import type {
	IDatabaseTemplateRepository,
	RepositoryConfig
} from '../../database/types/email-templates';

/**
 * Create a template registry with optional custom database repository.
 * @param databaseRepository - Optional custom database repository.
 * @returns TemplateRegistry instance.
 */
export function createTemplateRegistry(
	databaseRepository?: IDatabaseTemplateRepository
): TemplateRegistry {
	return new TemplateRegistry(databaseRepository);
}

/**
 * Create a template registry with database repository using custom config.
 * @param config - Optional partial repository config.
 * @returns TemplateRegistry instance.
 */
export function createTemplateRegistryWithDatabase(
	config?: Partial<RepositoryConfig>
): TemplateRegistry {
	const defaultConfig: RepositoryConfig = {
		enableCache: true,
		cacheConfig: {
			defaultTtl: 3600, // 1 hour
			templateByTypeTtl: 3600, // 1 hour
			allActiveTemplatesTtl: 1800, // 30 minutes
			templateByIdTtl: 7200 // 2 hours
		},
		retryAttempts: 3,
		retryDelay: 1000
	};

	const finalConfig = { ...defaultConfig, ...config };
	const databaseRepository = new DatabaseTemplateRepository(finalConfig);

	return new TemplateRegistry(databaseRepository);
}
