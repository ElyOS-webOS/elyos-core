/**
 * Nodemailer wrapper to handle Bun/SvelteKit compatibility issues
 */

let nodemailerInstance: any = null;

export async function getNodemailer() {
	if (nodemailerInstance) {
		return nodemailerInstance;
	}

	try {
		// Try different import methods
		console.log('Attempting to import nodemailer...');

		// Method 1: Standard ESM import
		try {
			const nm = await import('nodemailer');
			console.log('ESM import successful, checking structure:', {
				hasDefault: !!nm.default,
				hasCreateTransport: !!nm.default?.createTransport,
				directCreateTransport: !!nm.createTransport,
				keys: Object.keys(nm)
			});

			if (nm.default && typeof nm.default.createTransport === 'function') {
				nodemailerInstance = nm.default;
				console.log('✅ Using nm.default');
				return nodemailerInstance;
			}

			if (nm && typeof nm.createTransport === 'function') {
				nodemailerInstance = nm;
				console.log('✅ Using nm directly');
				return nodemailerInstance;
			}
		} catch (esmError) {
			console.log('ESM import failed:', (esmError as Error).message);
		}

		// Method 2: Dynamic require
		try {
			const { createRequire } = await import('module');
			const require = createRequire(import.meta.url);
			const nm = require('nodemailer');

			console.log('Require import successful, checking structure:', {
				hasCreateTransport: !!nm.createTransport,
				type: typeof nm,
				keys: Object.keys(nm)
			});

			if (nm.createTransport) {
				nodemailerInstance = nm;
				console.log('✅ Using require import');
				return nodemailerInstance;
			}
		} catch (requireError) {
			console.log('Require import failed:', (requireError as Error).message);
		}

		throw new Error('All nodemailer import methods failed');
	} catch (error) {
		console.error('❌ Failed to import nodemailer:', error);
		throw error;
	}
}

export async function createSMTPTransporter(config: {
	host: string;
	port: number;
	secure: boolean;
	username: string;
	password: string;
}) {
	const nodemailer = await getNodemailer();

	return nodemailer.createTransport({
		host: config.host,
		port: config.port,
		secure: config.secure,
		auth: {
			user: config.username,
			pass: config.password
		},
		// Gmail specific settings
		...(config.host.includes('gmail') && {
			service: 'gmail',
			tls: {
				rejectUnauthorized: false
			}
		})
	});
}
