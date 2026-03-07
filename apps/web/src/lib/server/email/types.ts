import type { CreateEmailOptions } from 'resend';

// Email error types
export enum EmailErrorType {
	CONFIGURATION_ERROR = 'configuration_error',
	VALIDATION_ERROR = 'validation_error',
	API_ERROR = 'api_error',
	TEMPLATE_ERROR = 'template_error',
	RATE_LIMIT_ERROR = 'rate_limit_error'
}

export interface EmailError {
	type: EmailErrorType;
	message: string;
	retryable: boolean;
	retryAfter?: number;
}

// Email sending interfaces
export interface SendEmailParams {
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
	from?: string;
	replyTo?: string;
	attachments?: EmailAttachment[];
}

export interface EmailAttachment {
	filename: string;
	content: string | Buffer;
	contentType?: string;
}

export interface EmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

// Template system types
export enum EmailTemplateType {
	WELCOME = 'welcome',
	PASSWORD_RESET = 'password_reset',
	NOTIFICATION = 'notification',
	EMAIL_VERIFICATION = 'email_verification',
	TWO_FACTOR_OTP = 'two_factor_otp',
	EMAIL_OTP_SIGN_IN = 'email_otp_sign_in'
}

export interface TemplatedEmailParams {
	to: string | string[];
	template: EmailTemplateType;
	data: Record<string, unknown>;
	from?: string;
	replyTo?: string;
	locale?: string; // Language code (e.g., 'hu', 'en')
	requestUrl?: string; // Optional request URL for dynamic base URL detection
}

// Email logging types
export enum EmailDeliveryStatus {
	PENDING = 'pending',
	SENT = 'sent',
	DELIVERED = 'delivered',
	FAILED = 'failed',
	BOUNCED = 'bounced',
	OPENED = 'opened',
	CLICKED = 'clicked'
}

export interface EmailLogParams {
	recipient: string;
	subject: string;
	template?: EmailTemplateType;
	messageId?: string;
	status: EmailDeliveryStatus;
	errorMessage?: string;
}

export interface EmailLog {
	id: string;
	messageId?: string;
	recipient: string;
	subject: string;
	templateType?: EmailTemplateType;
	status: EmailDeliveryStatus;
	errorMessage?: string;
	sentAt?: Date;
	deliveredAt?: Date;
	openedAt?: Date;
	clickedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface EmailLogFilters {
	messageId?: string;
	recipient?: string;
	status?: EmailDeliveryStatus;
	template?: EmailTemplateType;
	dateFrom?: Date;
	dateTo?: Date;
	limit?: number;
	offset?: number;
}

// Resend API types
export interface ResendEmailPayload {
	from: string;
	to: string[];
	subject: string;
	html?: string;
	text?: string;
	reply_to?: string;
	attachments?: Array<{
		filename: string;
		content: string | Buffer;
		content_type?: string;
	}>;
}

export interface ResendResponse {
	id: string;
	from: string;
	to: string[];
	created_at: string;
}

export interface ResendWebhookPayload {
	type: string;
	created_at: string;
	data: {
		email_id: string;
		from: string;
		to: string[];
		subject: string;
		created_at: string;
	};
}

// Configuration types
export interface EmailConfig {
	apiKey: string;
	fromEmail: string;
	fromName?: string;
	replyTo?: string;
	webhookSecret?: string;
	testMode: boolean;
	logLevel: 'debug' | 'info' | 'warn' | 'error';
	retryAttempts: number;
	retryDelay: number;
}
