import type { ThemeSettings } from './theme.js';
import type {
	BackgroundType,
	TaskbarPosition,
	TaskbarStyle,
	StartMenuViewMode,
	DesktopClickMode
} from '../constants.js';
import { APP_CONSTANTS, DEFAULTS } from '../constants.js';

export interface BackgroundSettings {
	type: BackgroundType;
	value: string;
	/** Háttérkép scope-ja: 'shared' (rendszer) vagy 'user' (felhasználó által feltöltött) */
	scope?: 'shared' | 'user';
	/** Háttérkép homályosítás mértéke pixelben, 0 = kikapcsolva (csak image típusnál) */
	blur?: number;
	/** Háttérkép szürkeárnyalatos megjelenítése (csak image típusnál) */
	grayscale?: boolean;
}

export interface TaskbarSettings {
	position: TaskbarPosition;
	style: TaskbarStyle;
	itemVisibility: Record<string, boolean>;
}

export interface StartMenuSettings {
	viewMode: StartMenuViewMode;
}

export interface DesktopSettings {
	clickMode: DesktopClickMode;
}

export interface UserSettings {
	windowPreview: boolean;
	screenshotThumbnailHeight: number;
	preferPerformance: boolean;
	background: BackgroundSettings;
	theme: ThemeSettings;
	taskbar: TaskbarSettings;
	startMenu: StartMenuSettings;
	desktop: DesktopSettings;
	/** Felhasználó nyelvi preferenciája (pl. "hu", "en"). */
	locale?: string;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
	windowPreview: false,
	screenshotThumbnailHeight: APP_CONSTANTS.DEFAULT_SCREENSHOT_HEIGHT,
	preferPerformance: false,
	background: DEFAULTS.BACKGROUND,
	theme: DEFAULTS.THEME,
	taskbar: DEFAULTS.TASKBAR,
	startMenu: DEFAULTS.START_MENU,
	desktop: DEFAULTS.DESKTOP
};
