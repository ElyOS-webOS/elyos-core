import { Resend, type CreateEmailOptions } from 'resend';
import { env } from '$lib/env';
import { EmailErrorType } from './types';
import type {
	EmailConfig,
	EmailError,
	ResendEmailPayload,
	ResendResponse,
	ResendWebhookPayload
} from './types';

/**
 * Resend client wrapper with error handling and retry logic.
 */
export class ResendClient {
	private resend: Resend;
	private config: EmailConfig;

	constructor(config?: Partial<EmailConfig>) {
		this.config = {
			apiKey: env.RESEND_API_KEY || '',
			fromEmail: env.RESEND_FROM_EMAIL || '',
			webhookSecret: env.RESEND_WEBHOOK_SECRET || '',
			testMode: env.EMAIL_TEST_MODE || false,
			logLevel: env.EMAIL_LOG_LEVEL ?? 'info',
			retryAttempts: 3,
			retryDelay: 1000,
			...config
		};

		this.resend = new Resend(this.config.apiKey);
	}

	/**
	 * Validate API key by making a test request.
	 */
	async validateApiKey(): Promise<boolean> {
		try {
			// Try to get domains to validate API key
			await this.resend.domains.list();
			return true;
		} catch (error) {
			this.log('error', 'API key validation failed', error);
			return false;
		}
	}

	/**
	 * Send email with retry logic.
	 * @param payload
	 */
	async send(payload: ResendEmailPayload): Promise<ResendResponse> {
		let lastError: EmailError | null = null;

		for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
			try {
				this.log('debug', `Sending email attempt ${attempt}`, {
					to: payload.to,
					subject: payload.subject
				});

				// Convert payload to Resend format
				// Ensure we have at least text content
				const textContent =
					payload.text || (payload.html ? payload.html.replace(/<[^>]*>/g, '') : '');

				const resendPayload: CreateEmailOptions = {
					from: payload.from,
					to: payload.to,
					subject: payload.subject,
					text: textContent,
					replyTo: payload.reply_to
				};

				// Add HTML content if available
				if (payload.html) {
					resendPayload.html = payload.html;
				}

				// Add attachments if present
				if (payload.attachments && payload.attachments.length > 0) {
					resendPayload.attachments = payload.attachments;
				}

				const response = await this.resend.emails.send(resendPayload);

				if (response.error) {
					throw this.createEmailError(response.error.message, 'API_ERROR');
				}

				this.log('info', 'Email sent successfully', {
					messageId: response.data?.id,
					to: payload.to
				});

				return {
					id: response.data!.id,
					from: payload.from,
					to: payload.to,
					created_at: new Date().toISOString()
				};
			} catch (error) {
				// Log the raw error for debugging
				this.log('error', 'Raw email send error', {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					attempt,
					payload: {
						to: payload.to,
						from: payload.from,
						subject: payload.subject
					}
				});

				lastError = this.handleError(error);

				// Don't retry non-retryable errors
				if (!lastError.retryable || attempt === this.config.retryAttempts) {
					break;
				}

				// Wait before retry with exponential backoff
				const delay = this.calculateRetryDelay(attempt, lastError.retryAfter);
				this.log('warn', `Retrying email send in ${delay}ms`, {
					attempt,
					error: lastError.message
				});

				await this.sleep(delay);
			}
		}

		throw lastError;
	}

	/**
	 * Handle webhook payload from Resend.
	 * @param payload
	 */
	async handleWebhook(payload: ResendWebhookPayload): Promise<void> {
		try {
			this.log('debug', 'Processing webhook', {
				type: payload.type,
				emailId: payload.data.email_id
			});

			// Webhook processing will be handled by the EmailLogger
			// This method validates the payload structure
			if (!payload.type || !payload.data?.email_id) {
				throw this.createEmailError('Invalid webhook payload structure', 'VALIDATION_ERROR');
			}

			this.log('info', 'Webhook processed successfully', {
				type: payload.type,
				emailId: payload.data.email_id
			});
		} catch (error) {
			this.log('error', 'Webhook processing failed', error);
			throw this.handleError(error);
		}
	}

	/**
	 * Get configuration for external use.
	 */
	getConfig(): EmailConfig {
		return { ...this.config };
	}

	/**
	 * Handle and classify errors.
	 * @param error
	 */
	private handleError(error: unknown): EmailError {
		if (error instanceof Error) {
			// Check for rate limiting
			if (error.message.includes('rate limit') || error.message.includes('429')) {
				return this.createEmailError(error.message, 'RATE_LIMIT_ERROR', true, 60000);
			}

			// Check for API errors
			if (
				error.message.includes('API') ||
				error.message.includes('401') ||
				error.message.includes('403')
			) {
				return this.createEmailError(error.message, 'API_ERROR', false);
			}

			// Check for validation errors
			if (error.message.includes('validation') || error.message.includes('invalid')) {
				return this.createEmailError(error.message, 'VALIDATION_ERROR', false);
			}

			// Network errors are retryable
			if (
				error.message.includes('network') ||
				error.message.includes('timeout') ||
				error.message.includes('ECONNRESET')
			) {
				return this.createEmailError(error.message, 'API_ERROR', true);
			}
		}

		// Default to non-retryable API error
		return this.createEmailError(
			error instanceof Error ? error.message : 'Unknown error occurred',
			'API_ERROR',
			false
		);
	}

	/**
	 * Create standardized email error.
	 * @param message
	 * @param type
	 * @param retryable
	 * @param retryAfter
	 */
	private createEmailError(
		message: string,
		type: keyof typeof EmailErrorType,
		retryable = false,
		retryAfter?: number
	): EmailError {
		return {
			type: EmailErrorType[type],
			message,
			retryable,
			retryAfter
		};
	}

	/**
	 * Calculate retry delay with exponential backoff and jitter.
	 * @param attempt
	 * @param retryAfter
	 */
	private calculateRetryDelay(attempt: number, retryAfter?: number): number {
		if (retryAfter) {
			return retryAfter;
		}

		// Exponential backoff: 1s, 2s, 4s, 8s, 16s
		const baseDelay = this.config.retryDelay * Math.pow(2, attempt - 1);

		// Add jitter (±25%)
		const jitter = baseDelay * 0.25 * (Math.random() * 2 - 1);

		return Math.max(1000, baseDelay + jitter);
	}

	/**
	 * Sleep utility for retry delays.
	 * @param ms
	 */
	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Logging utility.
	 * @param level
	 * @param message
	 * @param data
	 */
	private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
		const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
		const currentLevel = logLevels[this.config.logLevel];
		const messageLevel = logLevels[level];

		if (messageLevel >= currentLevel) {
			const timestamp = new Date().toISOString();
			const logData = data ? ` ${JSON.stringify(data)}` : '';
			console[level](`[${timestamp}] [ResendClient] ${message}${logData}`);
		}
	}
}
