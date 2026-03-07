export class ClientErrorReporter {
	private endpoint = '/api/log/client';

	async report(error: {
		message: string;
		stack?: string;
		context?: Record<string, unknown>;
	}): Promise<void> {
		const payload = {
			message: error.message,
			stack: error.stack,
			url: window.location.href,
			userAgent: navigator.userAgent,
			timestamp: new Date().toISOString(),
			context: error.context
		};

		try {
			await fetch(this.endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
		} catch (err) {
			console.error('[ClientErrorReporter] Failed to send error to server:', err);
		}
	}
}

export const clientErrorReporter = new ClientErrorReporter();
