import type { EmailTemplateType } from '../../email/types';
import type {
	CreateTemplateData,
	UpdateTemplateData,
	DatabaseEmailTemplate
} from '../types/email-templates';
import { TemplateSecurityValidator, SecurityValidationError } from './template-security-validator';
import { TemplateAuditLogger, AuditEventType } from './template-audit-logger';
import { TemplateRateLimiter } from './template-rate-limiter';

/**
 * Security context for template operations.
 */
export interface SecurityContext {
	userId?: string;
	userAgent?: string;
	ipAddress?: string;
	sessionId?: string;
	requestId?: string;
	templateId?: string;
	templateType?: string;
}

/**
 * Security check result.
 */
export interface SecurityCheckResult {
	allowed: boolean;
	errors: string[];
	warnings: string[];
	rateLimitInfo?: {
		remaining: number;
		resetTime: Date;
	};
}

/**
 * Comprehensive template security service that coordinates validation, audit logging, and rate limiting.
 */
export class TemplateSecurityService {
	private securityValidator: TemplateSecurityValidator;
	private auditLogger: TemplateAuditLogger;
	private rateLimiter: TemplateRateLimiter;

	constructor() {
		this.securityValidator = new TemplateSecurityValidator({
			maxTemplateSize: 1024 * 1024, // 1MB
			maxSubjectLength: 200,
			allowedHtmlTags: [
				'p',
				'br',
				'strong',
				'em',
				'u',
				'h1',
				'h2',
				'h3',
				'h4',
				'h5',
				'h6',
				'ul',
				'ol',
				'li',
				'a',
				'img',
				'div',
				'span',
				'table',
				'tr',
				'td',
				'th',
				'thead',
				'tbody',
				'tfoot',
				'blockquote',
				'pre',
				'code'
			]
		});

		this.auditLogger = new TemplateAuditLogger({
			enabled: true,
			logLevel: 'info',
			maskSensitiveData: true,
			retentionDays: 90,
			maxLogSize: 1024 * 1024 * 10, // 10MB
			enableFileLogging: false,
			enableDatabaseLogging: true
		});

		this.rateLimiter = new TemplateRateLimiter();
	}

	/**
	 * Perform comprehensive security check for template creation.
	 * @param templateData - The template data to validate.
	 * @param context - Security context.
	 * @returns Security check result.
	 */
	async checkTemplateCreation(
		templateData: CreateTemplateData,
		context: SecurityContext
	): Promise<SecurityCheckResult> {
		const result: SecurityCheckResult = {
			allowed: true,
			errors: [],
			warnings: []
		};

		try {
			// Rate limiting check
			const identifier = context.userId || context.ipAddress || 'anonymous';
			const rateLimitResults = this.rateLimiter.checkMultipleRateLimits(
				['template_create', 'security_validation', 'global_template'],
				identifier
			);

			for (const [operation, rateLimitResult] of rateLimitResults) {
				if (!rateLimitResult.allowed) {
					result.allowed = false;
					result.errors.push(`Rate limit exceeded for ${operation}`);
					result.rateLimitInfo = {
						remaining: rateLimitResult.remaining,
						resetTime: rateLimitResult.resetTime
					};

					// Log rate limit violation
					await this.auditLogger.logSecurityViolation(
						'rate_limit_exceeded',
						{
							operation,
							identifier,
							remaining: rateLimitResult.remaining,
							resetTime: rateLimitResult.resetTime
						},
						context
					);
				}
			}

			// Security validation
			const validationResult = this.securityValidator.validateCreateTemplate(templateData);
			if (!validationResult.isValid) {
				result.allowed = false;
				result.errors.push(...validationResult.errors.map((error) => this.getErrorMessage(error)));
				result.warnings.push(...validationResult.warnings);

				// Log security validation failure
				await this.auditLogger.logSecurityViolation(
					'template_validation_failed',
					{
						errors: validationResult.errors,
						warnings: validationResult.warnings,
						templateType: templateData.type
					},
					context
				);
			} else {
				// Log successful validation
				result.warnings.push(...validationResult.warnings);
			}

			return result;
		} catch (error) {
			result.allowed = false;
			result.errors.push(
				`Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);

			await this.auditLogger.logSecurityViolation(
				'security_check_error',
				{
					error: error instanceof Error ? error.message : 'Unknown error',
					templateType: templateData.type
				},
				context
			);

			return result;
		}
	}

	/**
	 * Perform comprehensive security check for template updates.
	 * @param templateId - The template ID being updated.
	 * @param updateData - The update data.
	 * @param originalTemplate - The original template.
	 * @param context - Security context.
	 * @returns Security check result.
	 */
	async checkTemplateUpdate(
		templateId: string,
		updateData: UpdateTemplateData,
		originalTemplate: DatabaseEmailTemplate,
		context: SecurityContext
	): Promise<SecurityCheckResult> {
		const result: SecurityCheckResult = {
			allowed: true,
			errors: [],
			warnings: []
		};

		try {
			// Rate limiting check
			const identifier = context.userId || context.ipAddress || 'anonymous';
			const rateLimitResults = this.rateLimiter.checkMultipleRateLimits(
				['template_update', 'security_validation', 'global_template'],
				identifier
			);

			for (const [operation, rateLimitResult] of rateLimitResults) {
				if (!rateLimitResult.allowed) {
					result.allowed = false;
					result.errors.push(`Rate limit exceeded for ${operation}`);
					result.rateLimitInfo = {
						remaining: rateLimitResult.remaining,
						resetTime: rateLimitResult.resetTime
					};

					await this.auditLogger.logSecurityViolation(
						'rate_limit_exceeded',
						{
							operation,
							identifier,
							templateId,
							remaining: rateLimitResult.remaining,
							resetTime: rateLimitResult.resetTime
						},
						context
					);
				}
			}

			// Security validation
			const validationResult = this.securityValidator.validateUpdateTemplate(updateData);
			if (!validationResult.isValid) {
				result.allowed = false;
				result.errors.push(...validationResult.errors.map((error) => this.getErrorMessage(error)));
				result.warnings.push(...validationResult.warnings);

				await this.auditLogger.logSecurityViolation(
					'template_validation_failed',
					{
						errors: validationResult.errors,
						warnings: validationResult.warnings,
						templateId,
						templateType: originalTemplate.type
					},
					context
				);
			} else {
				result.warnings.push(...validationResult.warnings);
			}

			return result;
		} catch (error) {
			result.allowed = false;
			result.errors.push(
				`Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);

			await this.auditLogger.logSecurityViolation(
				'security_check_error',
				{
					error: error instanceof Error ? error.message : 'Unknown error',
					templateId,
					templateType: originalTemplate.type
				},
				context
			);

			return result;
		}
	}

	/**
	 * Check if template access is allowed.
	 * @param templateType - The template type being accessed.
	 * @param context - Security context.
	 * @returns Security check result.
	 */
	async checkTemplateAccess(
		templateType: EmailTemplateType,
		context: SecurityContext
	): Promise<SecurityCheckResult> {
		const result: SecurityCheckResult = {
			allowed: true,
			errors: [],
			warnings: []
		};

		try {
			// Rate limiting check
			const identifier = context.userId || context.ipAddress || 'anonymous';
			const rateLimitResults = this.rateLimiter.checkMultipleRateLimits(
				['template_access', 'global_template'],
				identifier
			);

			for (const [operation, rateLimitResult] of rateLimitResults) {
				if (!rateLimitResult.allowed) {
					result.allowed = false;
					result.errors.push(`Rate limit exceeded for ${operation}`);
					result.rateLimitInfo = {
						remaining: rateLimitResult.remaining,
						resetTime: rateLimitResult.resetTime
					};

					await this.auditLogger.logSecurityViolation(
						'rate_limit_exceeded',
						{
							operation,
							identifier,
							templateType,
							remaining: rateLimitResult.remaining,
							resetTime: rateLimitResult.resetTime
						},
						context
					);
				}
			}

			return result;
		} catch (error) {
			result.allowed = false;
			result.errors.push(
				`Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);

			await this.auditLogger.logSecurityViolation(
				'security_check_error',
				{
					error: error instanceof Error ? error.message : 'Unknown error',
					templateType
				},
				context
			);

			return result;
		}
	}

	/**
	 * Sanitize template content for safe storage and rendering.
	 * @param templateData - The template data to sanitize.
	 * @returns Sanitized template data.
	 */
	sanitizeTemplateContent(templateData: CreateTemplateData | UpdateTemplateData): {
		sanitized: CreateTemplateData | UpdateTemplateData;
		warnings: string[];
	} {
		const warnings: string[] = [];
		const sanitized = { ...templateData };

		// Sanitize HTML content if present
		if (sanitized.htmlTemplate) {
			const originalLength = sanitized.htmlTemplate.length;
			sanitized.htmlTemplate = this.securityValidator.sanitizeHtmlContent(sanitized.htmlTemplate);

			if (sanitized.htmlTemplate.length < originalLength * 0.9) {
				warnings.push('HTML template was significantly modified during sanitization');
			}
		}

		// Remove HTML tags from subject and text templates
		if (sanitized.subjectTemplate) {
			const originalSubject = sanitized.subjectTemplate;
			sanitized.subjectTemplate = sanitized.subjectTemplate.replace(/<[^>]*>/g, '');

			if (originalSubject !== sanitized.subjectTemplate) {
				warnings.push('HTML tags removed from subject template');
			}
		}

		if (sanitized.textTemplate) {
			const originalText = sanitized.textTemplate;
			sanitized.textTemplate = sanitized.textTemplate.replace(/<[^>]*>/g, '');

			if (originalText !== sanitized.textTemplate) {
				warnings.push('HTML tags removed from text template');
			}
		}

		return { sanitized, warnings };
	}

	/**
	 * Get audit logs for security analysis.
	 * @param filters - Filters for audit logs.
	 * @returns Array of audit log entries.
	 */
	async getSecurityAuditLogs(filters?: {
		templateId?: string;
		templateType?: string;
		eventType?: AuditEventType;
		userId?: string;
		startDate?: Date;
		endDate?: Date;
		limit?: number;
	}): Promise<
		Array<{
			id: string;
			timestamp: Date;
			eventType: AuditEventType;
			templateId?: string;
			templateType?: string;
			userId?: string;
			action: string;
			details: Record<string, unknown>;
		}>
	> {
		// Get security violation logs
		const securityLogs = await this.auditLogger.getSecurityViolationLogs(filters?.limit || 100);

		// Filter based on provided criteria
		let filteredLogs = securityLogs;

		if (filters?.templateId) {
			filteredLogs = filteredLogs.filter((log) => log.templateId === filters.templateId);
		}

		if (filters?.templateType) {
			filteredLogs = filteredLogs.filter((log) => log.templateType === filters.templateType);
		}

		if (filters?.userId) {
			filteredLogs = filteredLogs.filter((log) => log.userId === filters.userId);
		}

		if (filters?.startDate) {
			filteredLogs = filteredLogs.filter((log) => log.timestamp >= filters.startDate!);
		}

		if (filters?.endDate) {
			filteredLogs = filteredLogs.filter((log) => log.timestamp <= filters.endDate!);
		}

		return filteredLogs.map((log) => ({
			id: log.id,
			timestamp: log.timestamp,
			eventType: log.eventType,
			templateId: log.templateId,
			templateType: log.templateType,
			userId: log.userId,
			action: log.action,
			details: log.details
		}));
	}

	/**
	 * Get rate limiting statistics.
	 * @returns Rate limiting statistics.
	 */
	getRateLimitingStats(): {
		totalEntries: number;
		activeWindows: number;
		expiredEntries: number;
		operationCounts: Map<string, number>;
	} {
		return this.rateLimiter.getStatistics();
	}

	/**
	 * Reset rate limits for a user (admin function).
	 * @param identifier - The user identifier to reset.
	 * @param context - Security context for audit logging.
	 */
	async resetUserRateLimits(identifier: string, context: SecurityContext): Promise<void> {
		this.rateLimiter.resetAllRateLimits(identifier);

		await this.auditLogger.logSecurityViolation(
			'rate_limits_reset',
			{
				targetIdentifier: identifier,
				resetBy: context.userId || 'system'
			},
			context
		);
	}

	/**
	 * Get security metrics and statistics.
	 * @returns Security metrics.
	 */
	async getSecurityMetrics(): Promise<{
		rateLimiting: ReturnType<TemplateRateLimiter['getStatistics']>;
		recentViolations: number;
		topViolationTypes: Array<{ type: string; count: number }>;
		activeUsers: number;
	}> {
		const rateLimitingStats = this.rateLimiter.getStatistics();
		const recentViolations = await this.auditLogger.getSecurityViolationLogs(50);

		// Count violation types
		const violationTypes = new Map<string, number>();
		recentViolations.forEach((log) => {
			const violationType = (log.details.violationType as string) || 'unknown';
			violationTypes.set(violationType, (violationTypes.get(violationType) || 0) + 1);
		});

		const topViolationTypes = Array.from(violationTypes.entries())
			.map(([type, count]) => ({ type, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		// Count unique users in recent violations
		const uniqueUsers = new Set(recentViolations.map((log) => log.userId).filter(Boolean));

		return {
			rateLimiting: rateLimitingStats,
			recentViolations: recentViolations.length,
			topViolationTypes,
			activeUsers: uniqueUsers.size
		};
	}

	/**
	 * Convert security validation error to human-readable message.
	 * @param error - The security validation error.
	 * @returns Human-readable error message.
	 */
	private getErrorMessage(error: SecurityValidationError): string {
		switch (error) {
			case SecurityValidationError.HTML_INJECTION_DETECTED:
				return 'Potentially dangerous HTML content detected';
			case SecurityValidationError.TEMPLATE_SIZE_EXCEEDED:
				return 'Template size exceeds maximum allowed limit';
			case SecurityValidationError.MALICIOUS_SCRIPT_DETECTED:
				return 'Malicious script content detected';
			case SecurityValidationError.SUSPICIOUS_CONTENT_DETECTED:
				return 'Suspicious content patterns detected';
			case SecurityValidationError.INVALID_TEMPLATE_STRUCTURE:
				return 'Invalid template structure';
			default:
				return 'Security validation failed';
		}
	}

	/**
	 * Clean up resources and stop background processes.
	 */
	destroy(): void {
		this.rateLimiter.destroy();
	}
}
