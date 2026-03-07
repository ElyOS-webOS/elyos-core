import type { EmailTemplateType } from '../../email/types';

/**
 * Database email template interface matching the database schema.
 */
export interface DatabaseEmailTemplate {
	id: string;
	type: string; // EmailTemplateType values
	locale: string; // Language code (e.g., 'hu', 'en')
	name: string;
	subjectTemplate: string;
	htmlTemplate: string;
	textTemplate: string;
	requiredData: string[];
	optionalData: string[] | null;
	isActive: boolean | null;
	createdAt: Date | null;
	updatedAt: Date | null;
}

/**
 * Data for creating a new template.
 */
export interface CreateTemplateData {
	type: EmailTemplateType;
	locale?: string; // Defaults to 'hu'
	name: string;
	subjectTemplate: string;
	htmlTemplate: string;
	textTemplate: string;
	requiredData: string[];
	optionalData?: string[];
}

/**
 * Data for updating an existing template.
 */
export interface UpdateTemplateData {
	name?: string;
	subjectTemplate?: string;
	htmlTemplate?: string;
	textTemplate?: string;
	requiredData?: string[];
	optionalData?: string[];
	isActive?: boolean;
}

/**
 * Database template error types.
 */
export enum DatabaseTemplateError {
	TEMPLATE_NOT_FOUND = 'template_not_found',
	TEMPLATE_VALIDATION_FAILED = 'template_validation_failed',
	DATABASE_CONNECTION_ERROR = 'database_connection_error',
	CACHE_ERROR = 'cache_error',
	MIGRATION_ERROR = 'migration_error',
	DUPLICATE_TEMPLATE_TYPE = 'duplicate_template_type',
	RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
}

/**
 * Template repository interface.
 */
export interface IDatabaseTemplateRepository {
	// Template queries
	getTemplateByType(
		type: EmailTemplateType,
		locale?: string
	): Promise<DatabaseEmailTemplate | null>;
	getAllActiveTemplates(): Promise<DatabaseEmailTemplate[]>;
	getTemplateById(id: string): Promise<DatabaseEmailTemplate | null>;

	// Template management
	createTemplate(template: CreateTemplateData): Promise<DatabaseEmailTemplate>;
	updateTemplate(id: string, updates: UpdateTemplateData): Promise<DatabaseEmailTemplate>;
	deactivateTemplate(id: string): Promise<void>;
	activateTemplate(id: string): Promise<void>;

	// Batch operations
	getTemplatesByTypes(
		types: EmailTemplateType[],
		locale?: string
	): Promise<Map<EmailTemplateType, DatabaseEmailTemplate>>;

	// Cache management
	invalidateCache(type?: EmailTemplateType): Promise<void>;
	refreshCache(): Promise<void>;
}

/**
 * Template cache interface.
 */
export interface ITemplateCache {
	get(key: string): Promise<DatabaseEmailTemplate | null>;
	set(key: string, template: DatabaseEmailTemplate, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;

	// Batch operations
	getMultiple(keys: string[]): Promise<Map<string, DatabaseEmailTemplate>>;
	setMultiple(entries: Map<string, DatabaseEmailTemplate>, ttl?: number): Promise<void>;

	// Utility methods
	has(key: string): Promise<boolean>;
	keys(): Promise<string[]>;
	getTtl(key: string): Promise<number>;
	extendTtl(key: string, ttl: number): Promise<boolean>;

	// Statistics and management
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
	};
	resetStats(): void;
	destroy(): void;
}

/**
 * Cache configuration.
 */
export interface CacheConfig {
	defaultTtl: number;
	templateByTypeTtl: number;
	allActiveTemplatesTtl: number;
	templateByIdTtl: number;
}

/**
 * Repository configuration.
 */
export interface RepositoryConfig {
	enableCache: boolean;
	cacheConfig: CacheConfig;
	retryAttempts: number;
	retryDelay: number;
}

/**
 * Migration result interface.
 */
export interface MigrationResult {
	migrationId: string;
	success: boolean;
	templatesProcessed: number;
	templatesCreated: number;
	templatesSkipped: number;
	templatesUpdated: number;
	errors: MigrationError[];
	startTime: Date;
	endTime: Date;
	duration: number;
}

/**
 * Migration error interface.
 */
export interface MigrationError {
	templateType: EmailTemplateType;
	error: string;
}

/**
 * Validation result interface.
 */
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
	warnings: string[];
	templatesValidated: number;
	validTemplates: number;
	invalidTemplates: number;
}

/**
 * Migration backup interface.
 */
export interface MigrationBackup {
	backupId: string;
	timestamp: Date;
	templates: DatabaseEmailTemplate[];
}
