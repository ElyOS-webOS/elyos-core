/**
 * Window State Storage Service
 * Manages window size and position persistence in localStorage
 */

import type { WindowSize } from '$lib/types/window';

export type StoredWindowState = {
	size: WindowSize;
	position: { x: number; y: number };
	isMaximized: boolean;
};

const STORAGE_KEY_PREFIX = 'elyos_window_state_';

/**
 * Get stored window state from localStorage
 * @param appName App identifier
 * @returns Stored window state or null if not found
 */
export function getStoredWindowState(appName: string): StoredWindowState | null {
	if (typeof window === 'undefined') return null;

	try {
		const key = `${STORAGE_KEY_PREFIX}${appName}`;
		const stored = localStorage.getItem(key);

		if (!stored) return null;

		const parsed = JSON.parse(stored) as StoredWindowState;
		return parsed;
	} catch (error) {
		console.error(`Failed to load window state for ${appName}:`, error);
		return null;
	}
}

/**
 * Save window state to localStorage
 * @param appName App identifier
 * @param state Window state to save
 */
export function saveWindowState(appName: string, state: StoredWindowState): void {
	if (typeof window === 'undefined') return;

	try {
		const key = `${STORAGE_KEY_PREFIX}${appName}`;
		localStorage.setItem(key, JSON.stringify(state));
	} catch (error) {
		console.error(`Failed to save window state for ${appName}:`, error);
	}
}

/**
 * Clear stored window state
 * @param appName App identifier
 */
export function clearWindowState(appName: string): void {
	if (typeof window === 'undefined') return;

	try {
		const key = `${STORAGE_KEY_PREFIX}${appName}`;
		localStorage.removeItem(key);
	} catch (error) {
		console.error(`Failed to clear window state for ${appName}:`, error);
	}
}

/**
 * Clear all stored window states
 */
export function clearAllWindowStates(): void {
	if (typeof window === 'undefined') return;

	try {
		const keys = Object.keys(localStorage);
		keys.forEach((key) => {
			if (key.startsWith(STORAGE_KEY_PREFIX)) {
				localStorage.removeItem(key);
			}
		});
	} catch (error) {
		console.error('Failed to clear all window states:', error);
	}
}
