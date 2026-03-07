/**
 * Központi export fájl az egyszerűsített importokhoz
 * Itt vannak összegyűjtve a leggyakrabban használt exportok
 */

// Konstansok
export {
	APP_CONSTANTS,
	APP_PATHS,
	ERROR_MESSAGES,
	SUCCESS_MESSAGES,
	DEFAULTS
} from './constants.js';

export type {
	TaskbarPosition,
	ThemeMode,
	FontSize,
	AppCategory,
	BackgroundType
} from './constants.js';

// Közös típusok (újra-exportálás a types/index.ts-ből)
export type {
	WindowSize,
	AppMetadata,
	AppParameters,
	UserSettings,
	ThemeSettings,
	BackgroundSettings,
	LocalizedText,
	IconType,
	IconData
} from './types/index.js';

export {
	DEFAULT_USER_SETTINGS,
	DEFAULT_THEME_SETTINGS,
	ICON_TYPES,
	localizedTextSchema
} from './types/index.js';

// Közös segédprogramok (újra-exportálás a utils/index.ts-ből)
export {
	cn,
	capitalizeFirstLetter,
	detectIconType,
	loadIcon,
	clearIconCache,
	takeWindowScreenshot
} from './utils/index.js';

export type {
	WithoutChild,
	WithoutChildren,
	WithoutChildrenOrChild,
	WithElementRef,
	LucideIconProps
} from './utils/index.js';

// Store exports (centralized from stores/index.ts)
export {
	WindowManager,
	createWindowManager,
	setWindowManager,
	getWindowManager,
	ThemeManager,
	createThemeManager,
	getThemeManager,
	RESTORE_SIZE_THRESHOLD,
	RESTORE_SIZE_RATIO
} from './stores/index.js';

export type { WindowState } from './stores/index.js';

// Theme components
export { default as ThemeToggle } from './components/ui/ThemeSwitcher.svelte';
export { default as ColorSchemePicker } from './components/ui/ColorSchemePicker.svelte';

// App loader exports
export { appLoader } from './apps/loader.js';
