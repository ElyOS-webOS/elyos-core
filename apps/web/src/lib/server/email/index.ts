// Core email service exports
export { EmailManager } from './manager';
export { ResendClient } from './client';
export { EmailLogger } from './logger';

// Template system exports
export {
	TemplateEngine,
	TemplateRegistry,
	createTemplateRegistry,
	createTemplateRegistryWithDatabase
} from './templates';
export type { EmailTemplate, RenderedTemplate, TemplateData } from './templates';

// Initialization and configuration exports
export {
	initializeEmailService,
	getEmailServiceState,
	getEmailManager,
	isEmailServiceAvailable,
	isEmailServiceDegraded,
	getEmailServiceHealth,
	performEmailHealthCheck,
	reinitializeEmailService,
	getEnvironmentSpecificConfig
} from './init';

// Enhanced initialization exports
export {
	EmailInitializationService,
	type EmailServiceState,
	type InitializationConfig,
	type HealthCheckResult
} from './initialization-service';

// Configuration validation exports
export {
	EmailConfigValidator,
	validateEmailConfiguration,
	type ConfigValidationResult
} from './config-validator';

// Utility functions for graceful email handling
export {
	sendEmailGracefully,
	sendTemplatedEmailGracefully,
	canSendEmails,
	getEmailServiceStatus
} from './utils';

// Diagnostics and troubleshooting
export { runEmailDiagnostics, printEmailDiagnostics } from './diagnostics';

// Type exports
export type {
	SendEmailParams,
	TemplatedEmailParams,
	EmailResult,
	EmailConfig,
	EmailLog,
	EmailLogParams,
	EmailLogFilters,
	EmailAttachment,
	EmailError,
	ResendEmailPayload,
	ResendResponse,
	ResendWebhookPayload
} from './types';

export { EmailErrorType, EmailTemplateType, EmailDeliveryStatus } from './types';

// Import for factory function
import { EmailManager } from './manager';
import { ResendClient } from './client';
import { EmailLogger } from './logger';
import { createTemplateRegistryWithDatabase } from './templates';
import type { EmailConfig } from './types';

// Convenience factory function
export function createEmailManager(config?: Partial<EmailConfig>): EmailManager {
	const client = new ResendClient(config);
	const logger = new EmailLogger();
	const templateRegistry = createTemplateRegistryWithDatabase();
	return new EmailManager(client, logger, templateRegistry);
}
