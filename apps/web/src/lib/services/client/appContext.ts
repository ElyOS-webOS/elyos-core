import { getContext } from 'svelte';
import { type AppParameters } from '$lib/types/window';
import { getWindowManager } from '$lib/stores';

export const APP_CONTEXT_KEY = Symbol('appContext');

export interface AppContext {
	parameters: AppParameters;
	windowId: string;
	windowManager?: unknown; // WindowManager instance
}

/**
 * Sets the app context (used internally by Window component).
 * @param {AppContext} context - The app context to set.
 * @returns {AppContext} The app context.
 */
export function setAppContext(context: AppContext) {
	// This will be set by the Window component when rendering the app
	return context;
}

/**
 * Gets the current app context.
 * @returns {AppContext} The app context.
 */
export function getAppContext(): AppContext {
	return getContext(APP_CONTEXT_KEY);
}

/**
 * Gets the parameters passed to the current app.
 * @returns {AppParameters} The parameters passed to the current app.
 */
export function getAppParameters(): AppParameters {
	const context = getAppContext();
	return context?.parameters || {};
}

/**
 * Gets the window ID of the current app.
 * @returns {string} The window ID of the current app.
 */
export function getWindowId(): string {
	const context = getAppContext();
	return context?.windowId || '';
}

/**
 * Convenience function to get a specific parameter with optional default value.
 * @param {string} key - The parameter key to retrieve.
 * @param {T} [defaultValue] - Optional default value if the parameter is not found.
 * @returns {T | undefined} The parameter value or the default value.
 */
export function getParameter<T = unknown>(key: string, defaultValue: T): T;
export function getParameter<T = unknown>(key: string): T | undefined;
export function getParameter<T = unknown>(key: string, defaultValue?: T): T | undefined {
	const parameters = getAppParameters();
	return (parameters[key] as T) ?? defaultValue;
}

/**
 * Updates the title of a specific window by ID.
 * @param {string} windowId - The ID of the window to update.
 * @param {string} newTitle - The new title for the window.
 */
export function updateWindowTitleById(windowId: string, newTitle: string): void {
	const windowManager = getWindowManager();
	windowManager.updateWindowTitle(windowId, newTitle);
}
