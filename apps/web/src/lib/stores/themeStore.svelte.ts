import { type ThemeSettings, type ThemeMode, DEFAULT_THEME_SETTINGS } from '$lib/types/theme';
import { invalidate } from '$app/navigation';

const THEME_STORAGE_KEY = 'desktop-theme-settings';

export class ThemeManager {
	settings = $state<ThemeSettings>({ ...DEFAULT_THEME_SETTINGS });
	private mediaQuery: MediaQueryList | null = null;
	private saveCallback: ((settings: ThemeSettings) => Promise<void>) | null = null;

	constructor(initialSettings?: Partial<ThemeSettings>) {
		// Ha kapunk kezdeti beállításokat (szerverről), használjuk azokat
		if (initialSettings) {
			this.settings = { ...DEFAULT_THEME_SETTINGS, ...initialSettings };
		} else {
			// Fallback: betöltjük a localStorage-ból (csak kliens oldalon, első betöltéskor)
			this.loadSettings();
		}

		// Auto mód esetén figyelünk a rendszer témára
		if (typeof window !== 'undefined') {
			this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
		}
	}

	/**
	 * Beállítja a mentési callback-et, ami cookie-ba menti a beállításokat.
	 * @param callback - A mentési callback függvény
	 */
	setSaveCallback(callback: (settings: ThemeSettings) => Promise<void>) {
		this.saveCallback = callback;
	}

	/**
	 * Téma mód beállítása (light, dark, auto).
	 * Desktop mód változtatásakor a taskbar mód is automatikusan követi.
	 * @param mode - Téma mód
	 */
	async setMode(mode: ThemeMode) {
		this.settings.mode = mode;
		// Desktop mód változtatásakor a taskbar mód is automatikusan követi
		this.settings.modeTaskbarStartMenu = mode;
		await this.saveSettings();
	}

	/**
	 * Start menu / Taskbar téma mód beállítása (light, dark, auto).
	 * @param mode - Téma mód
	 */
	async setModeTaskbarStartMenu(mode: ThemeMode) {
		this.settings.modeTaskbarStartMenu = mode;
		await this.saveSettings();
	}

	/**
	 * Színséma beállítása.
	 * @param color - Színséma
	 */
	async setColor(color: string) {
		this.settings.colorPrimaryHue = color;
		await this.saveSettings();
	}

	/**
	 * Betűméret beállítása.
	 * @param size - Betűméret
	 */
	async setFontSize(size: 'small' | 'medium' | 'large') {
		this.settings.fontSize = size;
		await this.saveSettings();
	}

	/**
	 * Teljes beállítások frissítése.
	 * @param newSettings - Új beállítások
	 */
	async updateSettings(newSettings: Partial<ThemeSettings>) {
		this.settings = { ...this.settings, ...newSettings };
		await this.saveSettings();
	}

	effectiveModeBase(mode: 'mode' | 'modeTaskbarStartMenu'): 'light' | 'dark' {
		if (this.settings[mode] === 'auto') {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
			return 'light';
		}
		return this.settings[mode] ?? 'light';
	}

	/**
	 * Aktuális effektív téma mód (auto esetén a rendszer beállítás alapján).
	 * @returns {"light" | "dark"} Aktuális effektív téma mód.
	 */
	get effectiveMode(): 'light' | 'dark' {
		return this.effectiveModeBase('mode');
	}

	/**
	 * Aktuális effektív téma mód (auto esetén a rendszer beállítás alapján).
	 * @returns {"light" | "dark"} Aktuális effektív téma mód.
	 */
	get effectiveModeTaskBarStartMenu(): 'light' | 'dark' {
		return this.effectiveModeBase('modeTaskbarStartMenu');
	}

	/**
	 * Sötét mód aktív-e.
	 * @returns {boolean} Sötét mód aktív-e.
	 */
	get isDark(): boolean {
		return this.effectiveMode === 'dark';
	}

	/**
	 * Világos mód aktív-e.
	 * @returns {boolean} Világos mód aktív-e.
	 */
	get isLight(): boolean {
		return this.effectiveMode === 'light';
	}

	/**
	 * CSS osztályok generálása a layout számára.
	 * @returns {string} CSS osztályok.
	 */
	get cssClasses(): string {
		const classes: string[] = [];

		// Téma mód
		classes.push(this.effectiveMode);

		// Betűméret
		if (this.settings.fontSize) {
			classes.push(`font-${this.settings.fontSize}`);
		}

		return classes.join(' ');
	}

	get cssClassesTaskBarStartMenu(): string {
		const classes: string[] = [];

		// Téma mód
		classes.push(this.effectiveModeTaskBarStartMenu);

		// Betűméret
		if (this.settings.fontSize) {
			classes.push(`font-${this.settings.fontSize}`);
		}

		return classes.join(' ');
	}

	/**
	 * CSS változók objektum generálása.
	 * @returns {Record<string, string>} CSS változók objektum.
	 */
	get cssVariables(): Record<string, string> {
		const vars: Record<string, string> = {};

		vars['--primary-h'] = this.settings.colorPrimaryHue;
		vars['--primary-l'] = this.settings.colorPrimaryLightness || '0.66';
		vars['--primary-c'] = this.settings.colorPrimaryChroma || '0.12';

		// Betűméret változók
		if (this.settings.fontSize === 'small') {
			vars['--base-font-size'] = '14px';
		} else if (this.settings.fontSize === 'large') {
			vars['--base-font-size'] = '18px';
		} else {
			vars['--base-font-size'] = '16px';
		}

		return vars;
	}

	/**
	 * Beállítások mentése cookie-ba (szerver API-n keresztül).
	 */
	private async saveSettings() {
		if (typeof window !== 'undefined') {
			try {
				// Ha van callback (szerver API), használjuk azt
				if (this.saveCallback) {
					await this.saveCallback(this.settings);
					// Frissítjük az oldalt, hogy a szerver újratöltse a beállításokat
					await invalidate('app:settings');
				} else {
					// Fallback: localStorage (csak fejlesztés során, ha nincs API)
					localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.settings));
				}
			} catch (error) {
				console.error('Nem sikerült menteni a téma beállításokat:', error);
			}
		}
	}

	/**
	 * Beállítások betöltése localStorage-ból.
	 */
	private loadSettings() {
		if (typeof window !== 'undefined') {
			try {
				const stored = localStorage.getItem(THEME_STORAGE_KEY);
				if (stored) {
					const parsed = JSON.parse(stored);
					this.settings = { ...DEFAULT_THEME_SETTINGS, ...parsed };
				}
			} catch (error) {
				console.error('Nem sikerült betölteni a téma beállításokat:', error);
			}
		}
	}

	/**
	 * Rendszer téma változás kezelése.
	 */
	private handleSystemThemeChange() {
		if (this.settings.mode === 'auto') {
			// Trigger reactivity
			this.settings = { ...this.settings };
		}
	}

	/**
	 * Cleanup.
	 */
	destroy() {
		if (this.mediaQuery) {
			this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
		}
	}
}

// Global singleton instance
let globalThemeManager: ThemeManager | null = null;

/**
 * Creates a new theme manager instance.
 * @param initialSettings - Kezdeti beállítások a szerverről
 * @returns A theme manager példány
 */
export function createThemeManager(initialSettings?: Partial<ThemeSettings>) {
	if (!globalThemeManager) {
		globalThemeManager = new ThemeManager(initialSettings);
	}
	return globalThemeManager;
}

/**
 * Gets the theme manager instance (global singleton).
 * @returns The theme manager instance
 */
export function getThemeManager(): ThemeManager {
	if (!globalThemeManager) {
		globalThemeManager = new ThemeManager();
	}
	return globalThemeManager;
}
