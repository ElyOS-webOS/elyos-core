import { env } from '$lib/env';

/**
 * Validates if an email address is allowed to receive emails
 * based on current email provider limitations.
 * @param {string} email The email address to validate.
 * @returns {object} An object containing validation results and suggestions.
 */
export function validateEmailRecipient(email: string): {
	valid: boolean;
	reason?: string;
	suggestion?: string;
} {
	const provider = env.EMAIL_PROVIDER || 'resend';

	// Provider-specific validation
	switch (provider) {
		case 'resend':
			const verifiedEmail = env.RESEND_VERIFIED_EMAIL || 'szigeti.developer@gmail.com';

			// For free Resend accounts, only verified email can receive emails
			if (email !== verifiedEmail) {
				return {
					valid: false,
					reason: `Resend free account can only send emails to verified address: ${verifiedEmail}`,
					suggestion: `Use ${verifiedEmail} as recipient or verify a domain at resend.com/domains`
				};
			}
			break;

		case 'smtp':
			// SMTP generally allows any email address
			// Could add specific validation here if needed
			break;

		case 'sendgrid':
		case 'ses':
			// These providers generally allow any email address
			// Could add specific validation here if needed
			break;
	}

	return { valid: true };
}

/**
 * Gets the verified email address for testing
 */
export function getVerifiedEmailAddress(): string {
	return env.RESEND_VERIFIED_EMAIL || 'szigeti.developer@gmail.com';
}

/**
 * Checks if we have a verified domain (not just the default resend.dev)
 */
export function hasVerifiedDomain(): boolean {
	const fromEmail = env.RESEND_FROM_EMAIL;
	return fromEmail ? !fromEmail.endsWith('@resend.dev') : false;
}
