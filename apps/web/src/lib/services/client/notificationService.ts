/**
 * Notification Service
 *
 * Client-side service for sending notifications from apps
 */

import { getNotificationStore } from '$lib/stores/notificationStore.svelte';

/**
 * Send a notification
 */
export interface SendNotificationOptions {
	userId?: number;
	userIds?: number[];
	broadcast?: boolean;
	appName?: string;
	title: string;
	message: string;
	type?: 'info' | 'success' | 'warning' | 'error' | 'critical';
	data?: Record<string, unknown>;
}

/**
 * Send a notification
 *
 * @example
 * // Send to specific user
 * await sendNotification({
 *   userId: '123',
 *   appName: 'chat',
 *   title: 'New Message',
 *   message: 'You have a new message from John',
 *   type: 'info'
 * });
 *
 * @example
 * // Broadcast to all users
 * await sendNotification({
 *   broadcast: true,
 *   title: 'System Maintenance',
 *   message: 'The system will be down for maintenance in 10 minutes',
 *   type: 'warning'
 * });
 */
export async function sendNotification(options: SendNotificationOptions): Promise<void> {
	const store = getNotificationStore();
	await store.sendNotification(options);
}

/**
 * Get notifications for the current app
 */
export function getAppNotifications(appName: string) {
	const store = getNotificationStore();
	return store.getAppNotifications(appName);
}

/**
 * Get unread count for the current app
 */
export function getAppUnreadCount(appName: string): number {
	const store = getNotificationStore();
	return store.getAppUnreadCount(appName);
}
