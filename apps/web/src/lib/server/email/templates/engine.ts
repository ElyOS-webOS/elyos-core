import * as v from 'valibot';
import type { EmailTemplateType } from '../types';

/**
 * Template rendering interfaces
 */
export interface RenderedTemplate {
	subject: string;
	html: string;
	text: string;
}

export interface EmailTemplate {
	subject: string;
	htmlTemplate: string;
	textTemplate: string;
	requiredData: string[];
	optionalData?: string[];
}

export interface TemplateData {
	[key: string]: unknown;
}

/**
 * Template engine for dynamic email content rendering
 */
export class TemplateEngine {
	private templates: Map<EmailTemplateType, EmailTemplate> = new Map();

	/**
	 * Register a template for a specific type.
	 */
	registerTemplate(type: EmailTemplateType, template: EmailTemplate): void {
		// Validate template structure
		this.validateTemplate(template);

		this.templates.set(type, template);
		this.log('debug', 'Template registered', { type, requiredData: template.requiredData });
	}

	/**
	 * Render a template with provided data.
	 */
	async render(template: EmailTemplateType, data: TemplateData): Promise<RenderedTemplate> {
		const templateDef = this.templates.get(template);

		if (!templateDef) {
			throw new Error(`Template not found: ${template}`);
		}

		// Validate template data
		this.validateTemplateData(template, data);

		try {
			// Render each part of the template with optional field information
			const subject = this.renderString(templateDef.subject, data, templateDef.optionalData || []);
			const html = this.renderString(
				templateDef.htmlTemplate,
				data,
				templateDef.optionalData || []
			);
			const text = this.renderString(
				templateDef.textTemplate,
				data,
				templateDef.optionalData || []
			);

			this.log('debug', 'Template rendered successfully', {
				template,
				dataKeys: Object.keys(data)
			});

			return {
				subject: this.sanitizeSubject(subject),
				html: this.sanitizeHtml(html),
				text: this.sanitizeText(text)
			};
		} catch (error) {
			this.log('error', 'Template rendering failed', {
				template,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
			throw new Error(
				`Template rendering failed for ${template}: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Validate template data against template requirements.
	 */
	validateTemplateData(template: EmailTemplateType, data: TemplateData): boolean {
		const templateDef = this.templates.get(template);

		if (!templateDef) {
			throw new Error(`Template not found: ${template}`);
		}

		// Check required data fields only - optional fields are not validated
		const missingFields = templateDef.requiredData.filter(
			(field) => !(field in data) || data[field] === undefined || data[field] === null
		);

		if (missingFields.length > 0) {
			throw new Error(`Missing required template data: ${missingFields.join(', ')}`);
		}

		// Validate data types for known fields
		this.validateDataTypes(data);

		return true;
	}

	/**
	 * Get registered template information.
	 */
	getTemplate(type: EmailTemplateType): EmailTemplate | undefined {
		return this.templates.get(type);
	}

	/**
	 * Get all registered template types.
	 */
	getRegisteredTemplates(): EmailTemplateType[] {
		return Array.from(this.templates.keys());
	}

	/**
	 * Check if a template is registered.
	 */
	hasTemplate(type: EmailTemplateType): boolean {
		return this.templates.has(type);
	}

	/**
	 * Render a string template with data substitution.
	 */
	private renderString(
		template: string,
		data: TemplateData,
		optionalFields: string[] = []
	): string {
		return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
			const value = data[key];

			if (value === undefined || value === null) {
				// If field is optional and no value provided, remove the placeholder
				if (optionalFields.includes(key)) {
					this.log('debug', 'Optional template variable not provided, removing placeholder', {
						key,
						template: template.substring(0, 50)
					});
					return '';
				}

				// If field is required but missing, keep placeholder for debugging
				this.log('warn', 'Template variable not found', {
					key,
					template: template.substring(0, 50)
				});
				return match;
			}

			return this.formatValue(value);
		});
	}

	/**
	 * Format a value for template insertion.
	 */
	private formatValue(value: unknown): string {
		if (typeof value === 'string') {
			return value;
		}

		if (typeof value === 'number' || typeof value === 'boolean') {
			return String(value);
		}

		if (value instanceof Date) {
			return value.toLocaleDateString();
		}

		if (typeof value === 'object' && value !== null) {
			return JSON.stringify(value);
		}

		return String(value);
	}

	/**
	 * Validate template structure.
	 */
	private validateTemplate(template: EmailTemplate): void {
		const templateSchema = v.object({
			subject: v.pipe(v.string(), v.minLength(1, 'Subject template cannot be empty')),
			htmlTemplate: v.pipe(v.string(), v.minLength(1, 'HTML template cannot be empty')),
			textTemplate: v.pipe(v.string(), v.minLength(1, 'Text template cannot be empty')),
			requiredData: v.array(v.string()),
			optionalData: v.optional(v.array(v.string()))
		});

		try {
			v.parse(templateSchema, template);
		} catch (error) {
			throw new Error(
				`Invalid template structure: ${error instanceof Error ? error.message : 'Unknown validation error'}`
			);
		}
	}

	/**
	 * Validate data types for common fields.
	 */
	private validateDataTypes(data: TemplateData): void {
		// Common field validations
		if ('email' in data && typeof data.email === 'string') {
			try {
				v.parse(v.pipe(v.string(), v.email()), data.email);
			} catch {
				throw new Error('Invalid email format in template data');
			}
		}

		if ('url' in data && typeof data.url === 'string') {
			try {
				new URL(data.url);
			} catch {
				throw new Error('Invalid URL format in template data');
			}
		}

		if ('date' in data && !(data.date instanceof Date) && typeof data.date !== 'string') {
			throw new Error('Date field must be a Date object or string');
		}
	}

	/**
	 * Sanitize subject line.
	 */
	private sanitizeSubject(subject: string): string {
		// Remove line breaks and excessive whitespace
		return subject
			.replace(/[\r\n]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.substring(0, 200); // Limit subject length
	}

	/**
	 * Sanitize HTML content.
	 */
	private sanitizeHtml(html: string): string {
		// Basic HTML sanitization - remove script tags and dangerous attributes
		return html
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
			.replace(/on\w+="[^"]*"/gi, '')
			.replace(/javascript:/gi, '')
			.trim();
	}

	/**
	 * Sanitize text content.
	 */
	private sanitizeText(text: string): string {
		// Remove excessive whitespace and normalize line breaks
		return text
			.replace(/\r\n/g, '\n')
			.replace(/\r/g, '\n')
			.replace(/\n{3,}/g, '\n\n')
			.trim();
	}

	/**
	 * Logging utility.
	 */
	private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
		const timestamp = new Date().toISOString();
		const logData = data ? ` ${JSON.stringify(data)}` : '';
		console[level](`[${timestamp}] [TemplateEngine] ${message}${logData}`);
	}
}
