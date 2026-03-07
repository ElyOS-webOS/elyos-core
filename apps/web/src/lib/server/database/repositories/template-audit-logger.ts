import type { EmailTemplateType } from '../../email/types';
import type {
	DatabaseEmailTemplate,
	CreateTemplateData,
	UpdateTemplateData
} from '../types/email-templates';

/**
 * Audit event types for template operations.
 */
export enum AuditEventType {
	TEMPLATE_CREATED = 'template_created',
	TEMPLATE_UPDATED = 'template_updated',
	TEMPLATE_DELETED = 'template_deleted',
	TEMPLATE_ACTIVATED = 'template_activated',
	TEMPLATE_DEACTIVATED = 'template_deactivated',
	TEMPLATE_ACCESSED = 'template_accessed',
	TEMPLATE_RENDERED = 'template_rendered',
	CACHE_INVALIDATED = 'cache_invalidated',
	SECURITY_VIOLATION = 'security_violation',
	MIGRATION_EXECUTED = 'migration_executed'
}

/**
 * Audit log entry interface.
 */
export interface AuditLogEntry {
	id: string;
	timestamp: Date;
	eventType: AuditEventType;
	templateId?: string;
	templateType?: string;
	userId?: string;
	userAgent?: string;
	ipAddress?: string;
	action: string;
	details: Record<string, unknown>;
	metadata: {
		sessionId?: string;
		requestId?: string;
		source: string;
		environment: string;
	};
	sensitiveDataMasked: boolean;
}

/**
 * Audit configuration interface.
 */
export interface AuditConfig {
	enabled: boolean;
	logLevel: 'debug' | 'info' | 'warn' | 'error';
	maskSensitiveData: boolean;
	retentionDays: number;
	maxLogSize: number;
	enableFileLogging: boolean;
	enableDatabaseLogging: boolean;
	logFilePath?: string;
}

/**
 * Template audit logger for tracking all template operations and security events.
 */
export class TemplateAuditLogger {
	private config: AuditConfig;
	private logBuffer: AuditLogEntry[] = [];
	private readonly maxBufferSize = 1000;

	constructor(config: AuditConfig) {
		this.config = config;

		// Start periodic flush if logging is enabled
		if (this.config.enabled) {
			this.startPeriodicFlush();
		}
	}

	/**
	 * Log template creation event.
	 * @param templateData - The template data being created.
	 * @param context - Additional context information.
	 */
	async logTemplateCreated(
		templateData: CreateTemplateData,
		context: {
			userId?: string;
			userAgent?: string;
			ipAddress?: string;
			sessionId?: string;
			requestId?: string;
		} = {}
	): Promise<void> {
		if (!this.config.enabled) return;

		const entry: AuditLogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			eventType: AuditEventType.TEMPLATE_CREATED,
			templateType: templateData.type,
			userId: context.userId,
			userAgent: context.userAgent,
			ipAddress: this.maskIpAddress(context.ipAddress),
			action: `Created template of type ${templateData.type}`,
			details: this.maskSensitiveData({
				templateName: templateData.name,
				requiredData: templateData.requiredData,
				optionalData: templateData.optionalData,
				subjectLength: templateData.subjectTemplate.length,
				htmlLength: templateData.htmlTemplate.length,
				textLength: templateData.textTemplate.length
			}),
			metadata: {
				sessionId: context.sessionId,
				requestId: context.requestId,
				source: 'template_repository',
				environment: process.env.NODE_ENV || 'development'
			},
			sensitiveDataMasked: this.config.maskSensitiveData
		};

		await this.writeLogEntry(entry);
	}

	/**
	 * Log template update event.
	 * @param templateId - The ID of the template being updated.
	 * @param updateData - The update data.
	 * @param originalTemplate - The original template before update.
	 * @param context - Additional context information.
	 */
	async logTemplateUpdated(
		templateId: string,
		updateData: UpdateTemplateData,
		originalTemplate: DatabaseEmailTemplate,
		context: {
			userId?: string;
			userAgent?: string;
			ipAddress?: string;
			sessionId?: string;
			requestId?: string;
		} = {}
	): Promise<void> {
		if (!this.config.enabled) return;

		const changes = this.detectChanges(originalTemplate, updateData);

		const entry: AuditLogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			eventType: AuditEventType.TEMPLATE_UPDATED,
			templateId,
			templateType: originalTemplate.type,
			userId: context.userId,
			userAgent: context.userAgent,
			ipAddress: this.maskIpAddress(context.ipAddress),
			action: `Updated template ${templateId}`,
			details: this.maskSensitiveData({
				changes,
				fieldsModified: Object.keys(updateData),
				originalName: originalTemplate.name,
				newName: updateData.name
			}),
			metadata: {
				sessionId: context.sessionId,
				requestId: context.requestId,
				source: 'template_repository',
				environment: process.env.NODE_ENV || 'development'
			},
			sensitiveDataMasked: this.config.maskSensitiveData
		};

		await this.writeLogEntry(entry);
	}

	/**
	 * Log template access event.
	 * @param templateType - The type of template being accessed.
	 * @param templateId - The ID of the template (if available).
	 * @param context - Additional context information.
	 */
	async logTemplateAccessed(
		templateType: EmailTemplateType,
		templateId?: string,
		context: {
			userId?: string;
			userAgent?: string;
			ipAddress?: string;
			sessionId?: string;
			requestId?: string;
			cacheHit?: boolean;
		} = {}
	): Promise<void> {
		if (!this.config.enabled) return;

		const entry: AuditLogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			eventType: AuditEventType.TEMPLATE_ACCESSED,
			templateId,
			templateType,
			userId: context.userId,
			userAgent: context.userAgent,
			ipAddress: this.maskIpAddress(context.ipAddress),
			action: `Accessed template of type ${templateType}`,
			details: this.maskSensitiveData({
				cacheHit: context.cacheHit || false,
				accessMethod: templateId ? 'by_id' : 'by_type'
			}),
			metadata: {
				sessionId: context.sessionId,
				requestId: context.requestId,
				source: 'template_repository',
				environment: process.env.NODE_ENV || 'development'
			},
			sensitiveDataMasked: this.config.maskSensitiveData
		};

		await this.writeLogEntry(entry);
	}

	/**
	 * Log template rendering event.
	 * @param templateType - The type of template being rendered.
	 * @param templateData - The data used for rendering.
	 * @param context - Additional context information.
	 */
	async logTemplateRendered(
		templateType: EmailTemplateType,
		templateData: Record<string, unknown>,
		context: {
			userId?: string;
			userAgent?: string;
			ipAddress?: string;
			sessionId?: string;
			requestId?: string;
			renderTime?: number;
		} = {}
	): Promise<void> {
		if (!this.config.enabled) return;

		const entry: AuditLogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			eventType: AuditEventType.TEMPLATE_RENDERED,
			templateType,
			userId: context.userId,
			userAgent: context.userAgent,
			ipAddress: this.maskIpAddress(context.ipAddress),
			action: `Rendered template of type ${templateType}`,
			details: this.maskSensitiveData({
				dataFields: Object.keys(templateData),
				renderTime: context.renderTime,
				dataSize: JSON.stringify(templateData).length
			}),
			metadata: {
				sessionId: context.sessionId,
				requestId: context.requestId,
				source: 'template_registry',
				environment: process.env.NODE_ENV || 'development'
			},
			sensitiveDataMasked: this.config.maskSensitiveData
		};

		await this.writeLogEntry(entry);
	}

	/**
	 * Log security violation event.
	 * @param violationType - The type of security violation.
	 * @param details - Details about the violation.
	 * @param context - Additional context information.
	 */
	async logSecurityViolation(
		violationType: string,
		details: Record<string, unknown>,
		context: {
			userId?: string;
			userAgent?: string;
			ipAddress?: string;
			sessionId?: string;
			requestId?: string;
			templateId?: string;
			templateType?: string;
		} = {}
	): Promise<void> {
		// Security violations are always logged regardless of config
		const entry: AuditLogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			eventType: AuditEventType.SECURITY_VIOLATION,
			templateId: context.templateId,
			templateType: context.templateType,
			userId: context.userId,
			userAgent: context.userAgent,
			ipAddress: this.maskIpAddress(context.ipAddress),
			action: `Security violation: ${violationType}`,
			details: this.maskSensitiveData({
				violationType,
				...details,
				severity: 'HIGH'
			}),
			metadata: {
				sessionId: context.sessionId,
				requestId: context.requestId,
				source: 'security_validator',
				environment: process.env.NODE_ENV || 'development'
			},
			sensitiveDataMasked: this.config.maskSensitiveData
		};

		await this.writeLogEntry(entry);

		// Also log to console for immediate attention
		console.error(`[SECURITY VIOLATION] ${violationType}`, {
			templateId: context.templateId,
			templateType: context.templateType,
			userId: context.userId,
			timestamp: entry.timestamp
		});
	}

	/**
	 * Log cache invalidation event.
	 * @param templateType - The template type whose cache was invalidated.
	 * @param context - Additional context information.
	 */
	async logCacheInvalidated(
		templateType?: EmailTemplateType,
		context: {
			userId?: string;
			sessionId?: string;
			requestId?: string;
			reason?: string;
		} = {}
	): Promise<void> {
		if (!this.config.enabled) return;

		const entry: AuditLogEntry = {
			id: this.generateId(),
			timestamp: new Date(),
			eventType: AuditEventType.CACHE_INVALIDATED,
			templateType,
			userId: context.userId,
			action: templateType
				? `Invalidated cache for ${templateType}`
				: 'Invalidated all template caches',
			details: this.maskSensitiveData({
				scope: templateType || 'all',
				reason: context.reason || 'manual'
			}),
			metadata: {
				sessionId: context.sessionId,
				requestId: context.requestId,
				source: 'template_repository',
				environment: process.env.NODE_ENV || 'development'
			},
			sensitiveDataMasked: this.config.maskSensitiveData
		};

		await this.writeLogEntry(entry);
	}

	/**
	 * Get audit logs for a specific template.
	 * @param templateId - The template ID to get logs for.
	 * @param limit - Maximum number of logs to return.
	 * @returns Array of audit log entries.
	 */
	async getTemplateAuditLogs(templateId: string, limit: number = 100): Promise<AuditLogEntry[]> {
		// In a real implementation, this would query the database
		// For now, return from memory buffer
		return this.logBuffer
			.filter((entry) => entry.templateId === templateId)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, limit);
	}

	/**
	 * Get audit logs by event type.
	 * @param eventType - The event type to filter by.
	 * @param limit - Maximum number of logs to return.
	 * @returns Array of audit log entries.
	 */
	async getAuditLogsByType(
		eventType: AuditEventType,
		limit: number = 100
	): Promise<AuditLogEntry[]> {
		return this.logBuffer
			.filter((entry) => entry.eventType === eventType)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			.slice(0, limit);
	}

	/**
	 * Get security violation logs.
	 * @param limit - Maximum number of logs to return.
	 * @returns Array of security violation log entries.
	 */
	async getSecurityViolationLogs(limit: number = 50): Promise<AuditLogEntry[]> {
		return this.getAuditLogsByType(AuditEventType.SECURITY_VIOLATION, limit);
	}

	/**
	 * Clean up old audit logs based on retention policy.
	 */
	async cleanupOldLogs(): Promise<void> {
		if (!this.config.enabled) return;

		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

		const initialCount = this.logBuffer.length;
		this.logBuffer = this.logBuffer.filter((entry) => entry.timestamp > cutoffDate);

		const removedCount = initialCount - this.logBuffer.length;
		if (removedCount > 0) {
			console.info(`[TemplateAuditLogger] Cleaned up ${removedCount} old audit logs`);
		}
	}

	/**
	 * Export audit logs for external analysis.
	 * @param startDate - Start date for export.
	 * @param endDate - End date for export.
	 * @returns Exported audit logs.
	 */
	async exportAuditLogs(startDate: Date, endDate: Date): Promise<AuditLogEntry[]> {
		return this.logBuffer.filter(
			(entry) => entry.timestamp >= startDate && entry.timestamp <= endDate
		);
	}

	/**
	 * Write log entry to configured destinations.
	 * @param entry - The audit log entry to write.
	 */
	private async writeLogEntry(entry: AuditLogEntry): Promise<void> {
		// Add to memory buffer
		this.logBuffer.push(entry);

		// Trim buffer if it exceeds max size
		if (this.logBuffer.length > this.maxBufferSize) {
			this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
		}

		// Log to console based on log level
		if (this.shouldLogToConsole(entry.eventType)) {
			this.logToConsole(entry);
		}

		// In a real implementation, you would also:
		// - Write to database if enableDatabaseLogging is true
		// - Write to file if enableFileLogging is true
		// - Send to external logging service
	}

	/**
	 * Determine if event should be logged to console.
	 * @param eventType - The event type to check.
	 * @returns True if should log to console.
	 */
	private shouldLogToConsole(eventType: AuditEventType): boolean {
		const logLevels = {
			debug: [AuditEventType.TEMPLATE_ACCESSED, AuditEventType.CACHE_INVALIDATED],
			info: [
				AuditEventType.TEMPLATE_CREATED,
				AuditEventType.TEMPLATE_UPDATED,
				AuditEventType.TEMPLATE_RENDERED
			],
			warn: [AuditEventType.TEMPLATE_DEACTIVATED, AuditEventType.TEMPLATE_DELETED],
			error: [AuditEventType.SECURITY_VIOLATION]
		};

		switch (this.config.logLevel) {
			case 'debug':
				return true;
			case 'info':
				return !logLevels.debug.includes(eventType);
			case 'warn':
				return logLevels.warn.includes(eventType) || logLevels.error.includes(eventType);
			case 'error':
				return logLevels.error.includes(eventType);
			default:
				return false;
		}
	}

	/**
	 * Log entry to console with appropriate level.
	 * @param entry - The audit log entry to log.
	 */
	private logToConsole(entry: AuditLogEntry): void {
		const message = `[AUDIT] ${entry.action}`;
		const data = {
			id: entry.id,
			eventType: entry.eventType,
			templateType: entry.templateType,
			userId: entry.userId,
			timestamp: entry.timestamp
		};

		switch (entry.eventType) {
			case AuditEventType.SECURITY_VIOLATION:
				console.error(message, data);
				break;
			case AuditEventType.TEMPLATE_DELETED:
			case AuditEventType.TEMPLATE_DEACTIVATED:
				console.warn(message, data);
				break;
			default:
				console.info(message, data);
		}
	}

	/**
	 * Mask sensitive data based on configuration.
	 * @param data - The data to potentially mask.
	 * @returns Masked or original data.
	 */
	private maskSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
		if (!this.config.maskSensitiveData) {
			return data;
		}

		const masked = { ...data };
		const sensitiveFields = ['email', 'password', 'token', 'key', 'secret'];

		Object.keys(masked).forEach((key) => {
			if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
				if (typeof masked[key] === 'string') {
					const value = masked[key] as string;
					masked[key] =
						value.length > 4
							? `${value.substring(0, 2)}***${value.substring(value.length - 2)}`
							: '***';
				} else {
					masked[key] = '***';
				}
			}
		});

		return masked;
	}

	/**
	 * Mask IP address for privacy.
	 * @param ipAddress - The IP address to mask.
	 * @returns Masked IP address.
	 */
	private maskIpAddress(ipAddress?: string): string | undefined {
		if (!ipAddress || !this.config.maskSensitiveData) {
			return ipAddress;
		}

		// Mask last octet of IPv4 or last segment of IPv6
		if (ipAddress.includes('.')) {
			const parts = ipAddress.split('.');
			return `${parts.slice(0, 3).join('.')}.***`;
		} else if (ipAddress.includes(':')) {
			const parts = ipAddress.split(':');
			return `${parts.slice(0, -1).join(':')}:***`;
		}

		return '***';
	}

	/**
	 * Detect changes between original template and update data.
	 * @param original - The original template.
	 * @param update - The update data.
	 * @returns Object describing the changes.
	 */
	private detectChanges(
		original: DatabaseEmailTemplate,
		update: UpdateTemplateData
	): Record<string, unknown> {
		const changes: Record<string, unknown> = {};

		Object.keys(update).forEach((key) => {
			const updateKey = key as keyof UpdateTemplateData;
			const originalValue = original[updateKey as keyof DatabaseEmailTemplate];
			const newValue = update[updateKey];

			if (originalValue !== newValue) {
				changes[key] = {
					from:
						this.config.maskSensitiveData &&
						typeof originalValue === 'string' &&
						originalValue.length > 100
							? `${originalValue.substring(0, 50)}...`
							: originalValue,
					to:
						this.config.maskSensitiveData && typeof newValue === 'string' && newValue.length > 100
							? `${newValue.substring(0, 50)}...`
							: newValue
				};
			}
		});

		return changes;
	}

	/**
	 * Generate unique ID for audit log entries.
	 * @returns Unique identifier.
	 */
	private generateId(): string {
		return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
	}

	/**
	 * Start periodic flush of log buffer.
	 */
	private startPeriodicFlush(): void {
		setInterval(() => {
			this.cleanupOldLogs();
		}, 60000 * 60); // Run every hour
	}
}
