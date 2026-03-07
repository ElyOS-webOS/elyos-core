import { env } from '$lib/env';
import { EmailManager } from './manager';
import { EmailLogger } from './logger';
import { createTemplateRegistryWithDatabase } from './templates';
import { EmailProviderFactory } from './providers/factory';

import { DatabaseTemplateRepository } from '../database/repositories/email-template-repository';
import { TemplateCacheManager } from '../database/repositories/email-template-cache-manager';
import { EmailConfigValidator } from './config-validator';
import type { EmailConfig } from './types';
import type { RepositoryConfig } from '../database/types/email-templates';

/**
 * Email service initialization state with enhanced configuration.
 */
export interface EmailServiceState {
	initialized: boolean;
	manager?: EmailManager;
	config?: EmailConfig;
	error?: string;
	degraded: boolean;
	cacheWarmedUp: boolean;
	healthStatus: 'healthy' | 'degraded' | 'unavailable';
}

/**
 * Initialization configuration options.
 */
export interface InitializationConfig {
	skipCacheWarmUp?: boolean;
	validateConfiguration?: boolean;
	repositoryConfig?: Partial<RepositoryConfig>;
	retryAttempts?: number;
	retryDelay?: number;
}

/**
 * Health check result.
 */
export interface HealthCheckResult {
	status: 'healthy' | 'degraded' | 'unavailable';
	checks: {
		configuration: boolean;
		database: boolean;
		cache: boolean;
		apiConnectivity: boolean;
	};
	errors: string[];
	warnings: string[];
	metrics: {
		initializationTime: number;
		cacheSize: number;
		templatesCount: number;
	};
}

/**
 * Enhanced email service initialization service.
 */
export class EmailInitializationService {
	private state: EmailServiceState = {
		initialized: false,
		degraded: false,
		cacheWarmedUp: false,
		healthStatus: 'unavailable'
	};

	private config: InitializationConfig;
	private repositoryConfig: RepositoryConfig;

	constructor(config: InitializationConfig = {}) {
		this.config = {
			skipCacheWarmUp: false,
			validateConfiguration: true,
			retryAttempts: 3,
			retryDelay: 1000,
			...config
		};

		this.repositoryConfig = {
			enableCache: true,
			cacheConfig: {
				defaultTtl: 3600, // 1 hour
				templateByTypeTtl: 3600, // 1 hour
				allActiveTemplatesTtl: 1800, // 30 minutes
				templateByIdTtl: 7200 // 2 hours
			},
			retryAttempts: this.config.retryAttempts || 3,
			retryDelay: this.config.retryDelay || 1000,
			...this.config.repositoryConfig
		};
	}

	/**
	 * Initialize email service with full configuration, migration, and cache warm-up.
	 */
	async initialize(): Promise<EmailServiceState> {
		const startTime = Date.now();
		this.log('info', 'Starting enhanced email service initialization');

		try {
			// Step 1: Create and validate configuration
			const emailConfig = await this.createAndValidateConfiguration();
			if (!emailConfig) {
				return this.setFailedState('Configuration validation failed');
			}

			// Step 2: Initialize email service components
			const manager = await this.initializeEmailComponents(emailConfig);
			if (!manager) {
				return this.setFailedState('Email components initialization failed');
			}

			// Step 3: Warm up cache if enabled
			if (!this.config.skipCacheWarmUp) {
				const cacheWarmedUp = await this.warmUpCache();
				this.state.cacheWarmedUp = cacheWarmedUp;

				if (!cacheWarmedUp) {
					this.log('warn', 'Cache warm-up failed, continuing with cold cache');
					this.state.degraded = true;
				}
			} else {
				this.state.cacheWarmedUp = true;
			}

			// Step 4: Validate API connectivity (if not in test mode)
			if (!emailConfig.testMode && this.config.validateConfiguration) {
				const connectivityValid = await this.validateApiConnectivity(manager);
				if (!connectivityValid) {
					this.log('warn', 'API connectivity validation failed, running in degraded mode');
					this.state.degraded = true;
				}
			}

			// Set final state
			this.state = {
				...this.state,
				initialized: true,
				manager,
				config: emailConfig,
				healthStatus: this.state.degraded ? 'degraded' : 'healthy'
			};

			const duration = Date.now() - startTime;
			this.log('info', 'Email service initialization completed', {
				duration,
				status: this.state.healthStatus,
				cacheWarmedUp: this.state.cacheWarmedUp
			});

			return this.state;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
			this.log('error', 'Email service initialization failed', { error: errorMessage });
			return this.setFailedState(errorMessage);
		}
	}

	/**
	 * Get current email service state.
	 */
	getState(): EmailServiceState {
		return { ...this.state };
	}

	/**
	 * Perform comprehensive health check.
	 */
	async performHealthCheck(): Promise<HealthCheckResult> {
		const startTime = Date.now();
		const result: HealthCheckResult = {
			status: 'unavailable',
			checks: {
				configuration: false,
				database: false,
				cache: false,
				apiConnectivity: false
			},
			errors: [],
			warnings: [],
			metrics: {
				initializationTime: 0,
				cacheSize: 0,
				templatesCount: 0
			}
		};

		try {
			// Check configuration
			result.checks.configuration = await this.checkConfiguration();
			if (!result.checks.configuration) {
				result.errors.push('Email configuration is invalid');
			}

			// Check database connectivity
			result.checks.database = await this.checkDatabaseConnectivity();
			if (!result.checks.database) {
				result.errors.push('Database connectivity failed');
			}

			// Check cache status
			result.checks.cache = await this.checkCacheStatus();
			if (!result.checks.cache) {
				result.warnings.push('Cache is not functioning properly');
			}

			// Check API connectivity (if manager is available)
			if (this.state.manager && this.state.config && !this.state.config.testMode) {
				result.checks.apiConnectivity = await this.validateApiConnectivity(this.state.manager);
				if (!result.checks.apiConnectivity) {
					result.warnings.push('API connectivity validation failed');
				}
			} else {
				result.checks.apiConnectivity = true; // Skip in test mode
			}

			// Collect metrics
			result.metrics.initializationTime = Date.now() - startTime;
			result.metrics.cacheSize = await this.getCacheSize();
			result.metrics.templatesCount = await this.getTemplatesCount();

			// Determine overall status
			const criticalChecks = [result.checks.configuration, result.checks.database];
			const allChecks = Object.values(result.checks);

			if (criticalChecks.every((check) => check)) {
				if (allChecks.every((check) => check)) {
					result.status = 'healthy';
				} else {
					result.status = 'degraded';
				}
			} else {
				result.status = 'unavailable';
			}

			this.log('info', 'Health check completed', {
				status: result.status,
				errors: result.errors.length,
				warnings: result.warnings.length,
				duration: result.metrics.initializationTime
			});

			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown health check error';
			result.errors.push(`Health check failed: ${errorMessage}`);
			result.status = 'unavailable';

			this.log('error', 'Health check failed', { error: errorMessage });
			return result;
		}
	}

	/**
	 * Reinitialize the email service.
	 */
	async reinitialize(config?: InitializationConfig): Promise<EmailServiceState> {
		this.log('info', 'Reinitializing email service');

		// Reset state
		this.state = {
			initialized: false,
			degraded: false,
			cacheWarmedUp: false,
			healthStatus: 'unavailable'
		};

		// Update configuration if provided
		if (config) {
			this.config = { ...this.config, ...config };
		}

		return await this.initialize();
	}

	/**
	 * Create and validate email configuration.
	 */
	private async createAndValidateConfiguration(): Promise<EmailConfig | null> {
		try {
			if (this.config.validateConfiguration) {
				const validation = EmailConfigValidator.validate();

				if (!validation.valid) {
					this.log('error', 'Configuration validation failed', {
						errors: validation.errors,
						warnings: validation.warnings
					});
					return null;
				}

				if (validation.warnings.length > 0) {
					this.log('warn', 'Configuration validation warnings', {
						warnings: validation.warnings,
						recommendations: validation.recommendations
					});
				}
			}

			const config = this.createEmailConfig();
			this.log('info', 'Email configuration created and validated successfully');
			return config;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Configuration creation failed';
			this.log('error', 'Failed to create email configuration', { error: errorMessage });
			return null;
		}
	}

	/**
	 * Initialize email service components.
	 */
	private async initializeEmailComponents(config: EmailConfig): Promise<EmailManager | null> {
		try {
			this.log('info', 'Initializing email service components');

			const client = EmailProviderFactory.createConfiguredClient(config);
			const logger = new EmailLogger();
			const templateRegistry = createTemplateRegistryWithDatabase(this.repositoryConfig);
			const manager = new EmailManager(client, logger, templateRegistry, config);

			this.log('info', 'Email service components initialized successfully');
			return manager;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Component initialization failed';
			this.log('error', 'Failed to initialize email components', { error: errorMessage });
			return null;
		}
	}

	/**
	 * Warm up template cache.
	 */
	private async warmUpCache(): Promise<boolean> {
		try {
			this.log('info', 'Starting cache warm-up');

			const repository = new DatabaseTemplateRepository(this.repositoryConfig);
			const templates = await repository.getAllActiveTemplates();

			if (templates.length === 0) {
				this.log('warn', 'No templates found for cache warm-up');
				return true; // Not a failure, just no templates to warm up
			}

			// Access the cache through the repository instance
			const cacheManager = new TemplateCacheManager(repository['cache']);
			await cacheManager.warmUp(templates);

			this.log('info', 'Cache warm-up completed successfully', {
				templatesWarmedUp: templates.length
			});
			return true;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Cache warm-up failed';
			this.log('error', 'Cache warm-up failed', { error: errorMessage });
			return false;
		}
	}

	/**
	 * Validate API connectivity.
	 */
	private async validateApiConnectivity(manager: EmailManager): Promise<boolean> {
		try {
			this.log('info', 'Validating API connectivity');

			const isValid = await manager.validateConfiguration();

			if (isValid) {
				this.log('info', 'API connectivity validation successful');
			} else {
				this.log('warn', 'API connectivity validation failed');
			}

			return isValid;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'API validation error';
			this.log('error', 'API connectivity validation failed', { error: errorMessage });
			return false;
		}
	}

	/**
	 * Set failed state.
	 */
	private setFailedState(error: string): EmailServiceState {
		this.state = {
			initialized: false,
			degraded: true,
			cacheWarmedUp: false,
			healthStatus: 'unavailable',
			error
		};
		return this.state;
	}

	/**
	 * Health check methods.
	 */
	private async checkConfiguration(): Promise<boolean> {
		try {
			const validation = EmailConfigValidator.validate();
			return validation.valid;
		} catch {
			return false;
		}
	}

	private async checkDatabaseConnectivity(): Promise<boolean> {
		try {
			const repository = new DatabaseTemplateRepository(this.repositoryConfig);
			await repository.getAllActiveTemplates();
			return true;
		} catch {
			return false;
		}
	}

	private async checkCacheStatus(): Promise<boolean> {
		try {
			const repository = new DatabaseTemplateRepository(this.repositoryConfig);
			const cacheManager = new TemplateCacheManager(repository['cache']);
			const health = await cacheManager.getHealthMetrics();
			return health.stats.size >= 0; // Cache is accessible
		} catch {
			return false;
		}
	}

	private async getCacheSize(): Promise<number> {
		try {
			const repository = new DatabaseTemplateRepository(this.repositoryConfig);
			const cacheManager = new TemplateCacheManager(repository['cache']);
			const health = await cacheManager.getHealthMetrics();
			return health.stats.size;
		} catch {
			return 0;
		}
	}

	private async getTemplatesCount(): Promise<number> {
		try {
			const repository = new DatabaseTemplateRepository(this.repositoryConfig);
			const templates = await repository.getAllActiveTemplates();
			return templates.length;
		} catch {
			return 0;
		}
	}

	/**
	 * Configuration creation and validation methods (from original init.ts).
	 */
	private createEmailConfig(): EmailConfig {
		const provider = env.EMAIL_PROVIDER || 'resend';

		const baseConfig = {
			testMode: env.EMAIL_TEST_MODE || false,
			logLevel: env.EMAIL_LOG_LEVEL || (env.NODE_ENV === 'development' ? 'debug' : 'info'),
			retryAttempts: 3,
			retryDelay: 1000
		};

		switch (provider) {
			case 'resend':
				return {
					...baseConfig,
					apiKey: env.RESEND_API_KEY || '',
					fromEmail: env.RESEND_FROM_EMAIL || '',
					fromName: env.APP_NAME || undefined,
					replyTo: env.RESEND_FROM_EMAIL || undefined,
					webhookSecret: env.RESEND_WEBHOOK_SECRET
				};

			case 'smtp':
				return {
					...baseConfig,
					apiKey: '',
					fromEmail: env.SMTP_FROM_EMAIL || env.SMTP_USERNAME || '',
					fromName: env.SMTP_FROM_NAME || env.APP_NAME || undefined,
					replyTo: env.SMTP_REPLY_TO || env.SMTP_FROM_EMAIL || env.SMTP_USERNAME || undefined,
					webhookSecret: undefined
				};

			default:
				throw new Error(`Unsupported email provider: ${provider}`);
		}
	}

	/**
	 * Logging utility.
	 */
	private log(level: 'info' | 'warn' | 'error', message: string, data?: unknown): void {
		const timestamp = new Date().toISOString();
		const logData = data ? ` ${JSON.stringify(data)}` : '';
		console[level](`[${timestamp}] [EmailInitializationService] ${message}${logData}`);
	}
}
