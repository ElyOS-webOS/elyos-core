/**
 * Notification Service
 *
 * Send notifications to the notification center.
 * Includes permission checking.
 */

import type {
	NotificationService as INotificationService,
	NotificationOptions
} from '../../types/index.js';
import { PluginErrorCode } from '../../types/index.js';

/** Notification service — send notifications to the notification center with permission checking. */
export class NotificationService implements INotificationService {
	/** Plugin identifier used in API requests */
	private readonly pluginId: string;
	/** Whether the plugin has the `notifications` permission */
	private readonly hasPermission: boolean;
	/** Optional dev-mode notification handler registered by the Racona core */
	private notificationFn: ((options: NotificationOptions) => Promise<void>) | null = null;

	/**
	 * @param pluginId - Unique plugin identifier
	 * @param permissions - List of permissions granted to the plugin (requires `notifications`)
	 */
	constructor(pluginId: string, permissions: string[]) {
		this.pluginId = pluginId;
		this.hasPermission = permissions.includes('notifications');
	}

	/**
	 * Register a notification handler (called by the Racona core in dev mode).
	 * @param fn - Function that sends a notification
	 */
	setDevNotificationHandler(fn: (options: NotificationOptions) => Promise<void>): void {
		this.notificationFn = fn;
	}

	/**
	 * Send a notification to the notification center.
	 * @param options - Notification data (userId, title, message, type)
	 * @throws `PERMISSION_DENIED` if the plugin does not have the `notifications` permission
	 * @throws `SERVER_ERROR` if the server returns a 5xx error
	 * @throws `NETWORK_ERROR` if a network error occurs
	 */
	async send(options: NotificationOptions): Promise<void> {
		if (!this.hasPermission) {
			throw new Error(
				`${PluginErrorCode.PERMISSION_DENIED}: Plugin does not have 'notifications' permission`
			);
		}

		// Use the registered handler if available (dev mode)
		if (this.notificationFn) {
			return this.notificationFn(options);
		}

		try {
			const response = await fetch(`/api/plugins/${this.pluginId}/notifications`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId: options.userId,
					title: options.title,
					message: options.message,
					type: options.type ?? 'info'
				}),
				credentials: 'same-origin'
			});

			if (!response.ok) {
				if (response.status === 403) {
					throw new Error(`${PluginErrorCode.PERMISSION_DENIED}: Permission denied`);
				}
				if (response.status >= 500) {
					throw new Error(`${PluginErrorCode.SERVER_ERROR}: Server error`);
				}
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					`Failed to send notification: ${(errorData as Record<string, string>).error ?? 'Unknown error'}`
				);
			}

			const result = (await response.json()) as { success: boolean; error?: string };

			if (!result.success) {
				throw new Error(`Failed to send notification: ${result.error ?? 'Unknown error'}`);
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('Failed to fetch')) {
				throw new Error(`${PluginErrorCode.NETWORK_ERROR}: Network error`);
			}
			throw error;
		}
	}
}
