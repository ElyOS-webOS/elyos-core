/**
 * Mock Notification Service
 *
 * Console-based értesítések.
 */

import type { NotificationService, NotificationOptions } from '../../types/index.js';

export class MockNotificationService implements NotificationService {
	async send(options: NotificationOptions): Promise<void> {
		console.log(
			`[Mock Notification] [${options.type ?? 'info'}] ${options.title}: ${options.message} (to: ${options.userId})`
		);
	}
}
