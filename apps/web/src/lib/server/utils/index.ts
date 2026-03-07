/**
 * Szerver oldali segédprogramok központi exportja.
 * Ez a fájl összegyűjti és exportálja az összes szerver oldali segédprogramot.
 */

// Közös típusok és validációs sémák (újra-exportálás a közös utils-ból)
export { localizedTextSchema, type LocalizedText } from '../../utils/validation';

// Adatbázis segédprogramok
export { handleDatabaseError, sanitizeSqlParameter, validatePaginationParams } from './database';

// Hitelesítési segédprogramok
export { validatePasswordStrength, validateEmail, validateUsername } from './auth';

// Email szolgáltatások és segédprogramok
export {
	// Core email services
	EmailManager,
	ResendClient,
	EmailLogger,
	createEmailManager,

	// Template system
	TemplateEngine,
	TemplateRegistry,
	createTemplateRegistry,

	// Initialization and configuration
	initializeEmailService,
	getEmailServiceState,
	getEmailManager,
	isEmailServiceAvailable,
	isEmailServiceDegraded,
	getEmailServiceHealth,
	reinitializeEmailService,
	getEnvironmentSpecificConfig,

	// Utility functions
	sendEmailGracefully,
	sendTemplatedEmailGracefully,
	canSendEmails,
	getEmailServiceStatus,

	// Diagnostics
	runEmailDiagnostics,
	printEmailDiagnostics
} from '../email';

// Email típusok exportálása
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
	EmailTemplate,
	RenderedTemplate,
	TemplateData,
	ResendEmailPayload,
	ResendResponse,
	ResendWebhookPayload
} from '../email';

export { EmailErrorType, EmailTemplateType, EmailDeliveryStatus } from '../email';

// Kényelmi wrapper függvények gyakori email műveletekhez
import type { SendEmailParams, TemplatedEmailParams, EmailResult } from '../email';
import {
	sendEmailGracefully,
	sendTemplatedEmailGracefully,
	getEmailManager,
	isEmailServiceAvailable,
	isEmailServiceDegraded,
	EmailTemplateType
} from '../email';

/**
 * Egyszerű email küldés wrapper függvény
 * Automatikusan inicializálja az email szolgáltatást és kezeli a hibákat
 */
export async function sendSimpleEmail(params: SendEmailParams): Promise<EmailResult> {
	// Use the graceful email sending function that's already exported
	return await sendEmailGracefully(params);
}

/**
 * Sablon alapú email küldés wrapper függvény
 * Automatikusan inicializálja az email szolgáltatást és kezeli a hibákat
 */
export async function sendTemplateEmail(params: TemplatedEmailParams): Promise<EmailResult> {
	// Use the graceful templated email sending function that's already exported
	return await sendTemplatedEmailGracefully(params);
}

/**
 * Üdvözlő email küldése új felhasználónak
 */
export async function sendWelcomeEmail(
	to: string,
	userData: { name: string; email: string; [key: string]: unknown }
): Promise<EmailResult> {
	return await sendTemplatedEmailGracefully({
		to,
		template: EmailTemplateType.WELCOME,
		data: userData
	});
}

/**
 * Jelszó visszaállítási email küldése
 */
export async function sendPasswordResetEmail(
	to: string,
	resetData: { name: string; resetLink: string; expiresAt: string; [key: string]: unknown }
): Promise<EmailResult> {
	return await sendTemplatedEmailGracefully({
		to,
		template: EmailTemplateType.PASSWORD_RESET,
		data: resetData
	});
}

/**
 * Értesítő email küldése
 */
export async function sendNotificationEmail(
	to: string,
	notificationData: { title: string; message: string; [key: string]: unknown }
): Promise<EmailResult> {
	return await sendTemplatedEmailGracefully({
		to,
		template: EmailTemplateType.NOTIFICATION,
		data: notificationData
	});
}

/**
 * Email szolgáltatás állapotának ellenőrzése
 */
export async function checkEmailServiceHealth(): Promise<{
	available: boolean;
	degraded: boolean;
	configValid: boolean;
	error?: string;
}> {
	try {
		const available = isEmailServiceAvailable();
		const degraded = isEmailServiceDegraded();

		if (!available) {
			return {
				available: false,
				degraded: false,
				configValid: false,
				error: 'Email service is not available'
			};
		}

		const emailManager = getEmailManager();
		const configValid = emailManager ? await emailManager.validateConfiguration() : false;

		return {
			available,
			degraded,
			configValid
		};
	} catch (error) {
		return {
			available: false,
			degraded: false,
			configValid: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
