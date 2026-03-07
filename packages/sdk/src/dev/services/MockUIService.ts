/**
 * Mock UI Service
 *
 * Console-based toast, egyszerű dialógusok, mock téma.
 */

import type {
	UIService,
	DialogOptions,
	DialogResult,
	ThemeColors,
	ToastType,
	WebOSComponents
} from '../../types/index.js';

export class MockUIService implements UIService {
	toast(message: string, type: ToastType = 'info', duration: number = 3000): void {
		console.log(`[Mock Toast ${type}] ${message} (${duration}ms)`);
	}

	async dialog(options: DialogOptions): Promise<DialogResult> {
		console.log('[Mock Dialog]', options);

		if (options.type === 'confirm') {
			return { action: 'confirm' };
		}
		if (options.type === 'prompt') {
			return { action: 'submit', value: 'mock-value' };
		}
		return { action: 'ok' };
	}

	get components(): WebOSComponents {
		return {};
	}

	get theme(): ThemeColors {
		return {
			primary: '#667eea',
			secondary: '#764ba2',
			accent: '#f093fb',
			background: '#ffffff',
			foreground: '#1a1a2e',
			muted: '#f1f5f9',
			mutedForeground: '#64748b',
			border: '#e2e8f0',
			input: '#e2e8f0',
			ring: '#667eea',
			destructive: '#ef4444',
			destructiveForeground: '#ffffff'
		};
	}
}
