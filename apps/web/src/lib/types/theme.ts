import type { ThemeMode, FontSize } from '../constants.js';
import { DEFAULTS } from '../constants.js';

export type { ThemeMode, FontSize };

export interface ThemeSettings {
	mode: ThemeMode;
	modeTaskbarStartMenu: ThemeMode;
	colorPrimaryHue: string;
	colorPrimaryLightness?: string; // OKLCH lightness (0-1)
	colorPrimaryChroma?: string; // OKLCH chroma (0-0.4)
	fontSize?: FontSize;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = DEFAULTS.THEME;
