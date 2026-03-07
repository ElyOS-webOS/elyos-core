import { env } from '$lib/env';
import { initializeEmailService, getEnvironmentSpecificConfig } from './init';

/**
 * Run email service diagnostics
 */
export async function runEmailDiagnostics(): Promise<{
	success: boolean;
	results: Array<{
		check: string;
		status: 'pass' | 'fail' | 'warn';
		message: string;
	}>;
}> {
	const results: Array<{
		check: string;
		status: 'pass' | 'fail' | 'warn';
		message: string;
	}> = [];

	// Check environment variables
	results.push({
		check: 'RESEND_API_KEY',
		status: env.RESEND_API_KEY ? 'pass' : 'fail',
		message: env.RESEND_API_KEY
			? 'API key is configured'
			: 'RESEND_API_KEY environment variable is missing'
	});

	results.push({
		check: 'RESEND_FROM_EMAIL',
		status: env.RESEND_FROM_EMAIL ? 'pass' : 'fail',
		message: env.RESEND_FROM_EMAIL
			? `From email configured: ${env.RESEND_FROM_EMAIL}`
			: 'RESEND_FROM_EMAIL environment variable is missing'
	});

	results.push({
		check: 'RESEND_WEBHOOK_SECRET',
		status: env.RESEND_WEBHOOK_SECRET ? 'pass' : 'warn',
		message: env.RESEND_WEBHOOK_SECRET
			? 'Webhook secret is configured'
			: 'RESEND_WEBHOOK_SECRET not configured (optional but recommended for production)'
	});

	// Check environment-specific configuration
	const envConfig = getEnvironmentSpecificConfig();

	results.push({
		check: 'Environment Configuration',
		status: envConfig.warnings.length > 0 ? 'warn' : 'pass',
		message:
			envConfig.warnings.length > 0
				? `Warnings: ${envConfig.warnings.join(', ')}`
				: `Environment: ${envConfig.environment} - configuration looks good`
	});

	// Test service initialization
	try {
		const serviceState = await initializeEmailService();

		results.push({
			check: 'Service Initialization',
			status: serviceState.initialized ? (serviceState.degraded ? 'warn' : 'pass') : 'fail',
			message: serviceState.initialized
				? serviceState.degraded
					? `Initialized in degraded mode: ${serviceState.error}`
					: 'Service initialized successfully'
				: `Initialization failed: ${serviceState.error}`
		});

		// Test API connectivity (only if not in test mode)
		if (serviceState.manager && serviceState.config && !serviceState.config.testMode) {
			try {
				const isValid = await serviceState.manager.validateConfiguration();
				results.push({
					check: 'API Connectivity',
					status: isValid ? 'pass' : 'fail',
					message: isValid
						? 'Successfully connected to Resend API'
						: 'Failed to validate API connection'
				});
			} catch (error) {
				results.push({
					check: 'API Connectivity',
					status: 'fail',
					message: `API validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
				});
			}
		} else {
			results.push({
				check: 'API Connectivity',
				status: 'warn',
				message: 'Skipped (test mode enabled or service not initialized)'
			});
		}
	} catch (error) {
		results.push({
			check: 'Service Initialization',
			status: 'fail',
			message: `Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`
		});
	}

	// Overall success determination
	const hasFailures = results.some((r) => r.status === 'fail');
	const success = !hasFailures;

	return {
		success,
		results
	};
}

/**
 * Print diagnostics results to console
 */
export async function printEmailDiagnostics(): Promise<void> {
	console.log('\n=== Email Service Diagnostics ===\n');

	const { success, results } = await runEmailDiagnostics();

	for (const result of results) {
		const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
		console.log(`${icon} ${result.check}: ${result.message}`);
	}

	console.log(`\n=== Overall Status: ${success ? '✅ PASS' : '❌ FAIL'} ===\n`);

	if (!success) {
		console.log('Please fix the failing checks before using the email service.\n');
	}
}
