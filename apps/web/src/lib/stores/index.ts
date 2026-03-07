/**
 * Globális store-ok központi exportja
 *
 * Ez a fájl összegyűjti és újra-exportálja az összes globális store-t
 * az egyszerűsített importok érdekében.
 */

// Window management store
export {
	WindowManager,
	createWindowManager,
	setWindowManager,
	getWindowManager,
	RESTORE_SIZE_THRESHOLD,
	RESTORE_SIZE_RATIO
} from './windowStore.svelte.js';

export type { WindowState } from './windowStore.svelte.js';

// Theme management store
export { ThemeManager, createThemeManager, getThemeManager } from './themeStore.svelte.js';

// Re-export theme types for convenience
export type { ThemeSettings, ThemeMode } from '../types/theme.js';

// Permission store
export {
	loadPermissions,
	reloadPermissions,
	hasPermission,
	hasAnyPermission,
	hasAllPermissions,
	getPermissions,
	isPermissionsLoaded
} from './permissionStore.svelte.js';

// Desktop store
export {
	DesktopStore,
	createDesktopStore,
	setDesktopStore,
	getDesktopStore,
	GRID_SIZE
} from './desktopStore.svelte.js';

// Connection store
export { getConnectionStore } from './connectionStore.svelte.js';

// Dev mode store
export { setDevMode, isDevMode } from './devModeStore.svelte.js';
