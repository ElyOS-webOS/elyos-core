import DOMPurify from 'isomorphic-dompurify';
import type { CreateTemplateData, UpdateTemplateData } from '../types/email-templates';

/**
 * Security validation errors.
 */
export enum SecurityValidationError {
	HTML_INJECTION_DETECTED = 'html_injection_detected',
	TEMPLATE_SIZE_EXCEEDED = 'template_size_exceeded',
	MALICIOUS_SCRIPT_DETECTED = 'malicious_script_detected',
	SUSPICIOUS_CONTENT_DETECTED = 'suspicious_content_detected',
	INVALID_TEMPLATE_STRUCTURE = 'invalid_template_structure'
}

/**
 * Security validation result.
 */
export interface SecurityValidationResult {
	isValid: boolean;
	errors: SecurityValidationError[];
	warnings: string[];
	sanitizedContent?: {
		subjectTemplate?: string;
		htmlTemplate?: string;
		textTemplate?: string;
	};
}

/**
 * Template security validator for preventing HTML injection and other security issues.
 */
export class TemplateSecurityValidator {
	private readonly maxTemplateSize: number;
	private readonly maxSubjectLength: number;
	private readonly allowedHtmlTags: string[];
	private readonly blockedPatterns: RegExp[];

	constructor(config?: {
		maxTemplateSize?: number;
		maxSubjectLength?: number;
		allowedHtmlTags?: string[];
		blockedPatterns?: RegExp[];
	}) {
		this.maxTemplateSize = config?.maxTemplateSize || 1024 * 1024; // 1MB
		this.maxSubjectLength = config?.maxSubjectLength || 200;
		this.allowedHtmlTags = config?.allowedHtmlTags || [
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
			'tfoot'
		];
		this.blockedPatterns = config?.blockedPatterns || [
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			/javascript:/gi,
			/on\w+\s*=/gi,
			/<iframe\b[^>]*>/gi,
			/<object\b[^>]*>/gi,
			/<embed\b[^>]*>/gi,
			/<form\b[^>]*>/gi,
			/<input\b[^>]*>/gi,
			/<meta\b[^>]*>/gi,
			/<link\b[^>]*>/gi
		];
	}

	/**
	 * Validate template creation data for security issues.
	 * @param templateData - The template data to validate.
	 * @returns Security validation result.
	 */
	validateCreateTemplate(templateData: CreateTemplateData): SecurityValidationResult {
		const result: SecurityValidationResult = {
			isValid: true,
			errors: [],
			warnings: [],
			sanitizedContent: {}
		};

		// Validate template size
		this.validateTemplateSize(templateData, result);

		// Validate subject template
		this.validateSubjectTemplate(templateData.subjectTemplate, result);

		// Validate HTML template
		this.validateHtmlTemplate(templateData.htmlTemplate, result);

		// Validate text template
		this.validateTextTemplate(templateData.textTemplate, result);

		// Validate template structure
		this.validateTemplateStructure(templateData, result);

		result.isValid = result.errors.length === 0;
		return result;
	}

	/**
	 * Validate template update data for security issues.
	 * @param updateData - The update data to validate.
	 * @returns Security validation result.
	 */
	validateUpdateTemplate(updateData: UpdateTemplateData): SecurityValidationResult {
		const result: SecurityValidationResult = {
			isValid: true,
			errors: [],
			warnings: [],
			sanitizedContent: {}
		};

		// Only validate fields that are being updated
		if (updateData.subjectTemplate !== undefined) {
			this.validateSubjectTemplate(updateData.subjectTemplate, result);
		}

		if (updateData.htmlTemplate !== undefined) {
			this.validateHtmlTemplate(updateData.htmlTemplate, result);
		}

		if (updateData.textTemplate !== undefined) {
			this.validateTextTemplate(updateData.textTemplate, result);
		}

		// Validate size if content fields are being updated
		if (updateData.subjectTemplate || updateData.htmlTemplate || updateData.textTemplate) {
			const totalSize =
				(updateData.subjectTemplate || '').length +
				(updateData.htmlTemplate || '').length +
				(updateData.textTemplate || '').length;

			if (totalSize > this.maxTemplateSize) {
				result.errors.push(SecurityValidationError.TEMPLATE_SIZE_EXCEEDED);
			}
		}

		result.isValid = result.errors.length === 0;
		return result;
	}

	/**
	 * Sanitize HTML content to remove potentially dangerous elements.
	 * @param htmlContent - The HTML content to sanitize.
	 * @returns Sanitized HTML content.
	 */
	sanitizeHtmlContent(htmlContent: string): string {
		// Configure DOMPurify with allowed tags and attributes
		const config = {
			ALLOWED_TAGS: this.allowedHtmlTags,
			ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'style'],
			ALLOW_DATA_ATTR: false,
			FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'meta', 'link'],
			FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
		};

		return DOMPurify.sanitize(htmlContent, config);
	}

	/**
	 * Check if content contains potentially malicious patterns.
	 * @param content - The content to check.
	 * @returns True if malicious patterns are detected.
	 */
	private containsMaliciousPatterns(content: string): boolean {
		return this.blockedPatterns.some((pattern) => pattern.test(content));
	}

	/**
	 * Validate template size limits.
	 * @param templateData - The template data to validate.
	 * @param result - The validation result to update.
	 */
	private validateTemplateSize(
		templateData: CreateTemplateData | UpdateTemplateData,
		result: SecurityValidationResult
	): void {
		const totalSize =
			(templateData.subjectTemplate || '').length +
			(templateData.htmlTemplate || '').length +
			(templateData.textTemplate || '').length;

		if (totalSize > this.maxTemplateSize) {
			result.errors.push(SecurityValidationError.TEMPLATE_SIZE_EXCEEDED);
		}

		// Warning for large templates (80% of limit)
		if (totalSize > this.maxTemplateSize * 0.8) {
			result.warnings.push(
				`Template size is ${Math.round(totalSize / 1024)}KB, approaching limit of ${Math.round(this.maxTemplateSize / 1024)}KB`
			);
		}
	}

	/**
	 * Validate subject template for security issues.
	 * @param subjectTemplate - The subject template to validate.
	 * @param result - The validation result to update.
	 */
	private validateSubjectTemplate(subjectTemplate: string, result: SecurityValidationResult): void {
		if (subjectTemplate.length > this.maxSubjectLength) {
			result.errors.push(SecurityValidationError.TEMPLATE_SIZE_EXCEEDED);
		}

		// Check for HTML tags in subject (should be plain text)
		if (/<[^>]*>/g.test(subjectTemplate)) {
			result.warnings.push(
				'Subject template contains HTML tags, which may not render correctly in email clients'
			);
		}

		// Check for malicious patterns
		if (this.containsMaliciousPatterns(subjectTemplate)) {
			result.errors.push(SecurityValidationError.MALICIOUS_SCRIPT_DETECTED);
		}

		// Sanitize and store
		result.sanitizedContent!.subjectTemplate = subjectTemplate.replace(/<[^>]*>/g, '');
	}

	/**
	 * Validate HTML template for security issues.
	 * @param htmlTemplate - The HTML template to validate.
	 * @param result - The validation result to update.
	 */
	private validateHtmlTemplate(htmlTemplate: string, result: SecurityValidationResult): void {
		// Check for malicious patterns
		if (this.containsMaliciousPatterns(htmlTemplate)) {
			result.errors.push(SecurityValidationError.MALICIOUS_SCRIPT_DETECTED);
		}

		// Check for suspicious content
		const suspiciousPatterns = [
			/eval\s*\(/gi,
			/document\.write/gi,
			/window\.location/gi,
			/\.innerHTML\s*=/gi
		];

		if (suspiciousPatterns.some((pattern) => pattern.test(htmlTemplate))) {
			result.errors.push(SecurityValidationError.SUSPICIOUS_CONTENT_DETECTED);
		}

		// Sanitize HTML content
		const sanitized = this.sanitizeHtmlContent(htmlTemplate);
		result.sanitizedContent!.htmlTemplate = sanitized;

		// Check if sanitization removed content
		if (sanitized.length < htmlTemplate.length * 0.9) {
			result.warnings.push('HTML template was significantly modified during sanitization');
		}
	}

	/**
	 * Validate text template for security issues.
	 * @param textTemplate - The text template to validate.
	 * @param result - The validation result to update.
	 */
	private validateTextTemplate(textTemplate: string, result: SecurityValidationResult): void {
		// Check for malicious patterns (even in text)
		if (this.containsMaliciousPatterns(textTemplate)) {
			result.errors.push(SecurityValidationError.MALICIOUS_SCRIPT_DETECTED);
		}

		// Text templates should not contain HTML
		if (/<[^>]*>/g.test(textTemplate)) {
			result.warnings.push('Text template contains HTML tags, which should be plain text');
		}

		// Store sanitized version (remove any HTML tags)
		result.sanitizedContent!.textTemplate = textTemplate.replace(/<[^>]*>/g, '');
	}

	/**
	 * Validate template structure for consistency and security.
	 * @param templateData - The template data to validate.
	 * @param result - The validation result to update.
	 */
	private validateTemplateStructure(
		templateData: CreateTemplateData | UpdateTemplateData,
		result: SecurityValidationResult
	): void {
		// Check for required data consistency
		if ('requiredData' in templateData && templateData.requiredData) {
			const requiredFields = templateData.requiredData;
			const allContent = [
				templateData.subjectTemplate || '',
				templateData.htmlTemplate || '',
				templateData.textTemplate || ''
			].join(' ');

			// Check if all required fields are actually used in templates
			const unusedFields = requiredFields.filter((field) => {
				const pattern = new RegExp(`\\{\\{\\s*${field}\\s*\\}\\}`, 'g');
				return !pattern.test(allContent);
			});

			if (unusedFields.length > 0) {
				result.warnings.push(`Required fields not used in templates: ${unusedFields.join(', ')}`);
			}
		}

		// Check for template variable consistency
		const variablePattern = /\{\{(\w+)\}\}/g;
		const allVariables = new Set<string>();

		[templateData.subjectTemplate, templateData.htmlTemplate, templateData.textTemplate]
			.filter(Boolean)
			.forEach((template) => {
				let match;
				while ((match = variablePattern.exec(template!)) !== null) {
					allVariables.add(match[1]);
				}
			});

		// Check for potentially dangerous variable names
		const dangerousVariables = Array.from(allVariables).filter((variable) =>
			/^(script|eval|function|window|document)$/i.test(variable)
		);

		if (dangerousVariables.length > 0) {
			result.errors.push(SecurityValidationError.SUSPICIOUS_CONTENT_DETECTED);
			result.warnings.push(
				`Potentially dangerous variable names: ${dangerousVariables.join(', ')}`
			);
		}
	}
}
