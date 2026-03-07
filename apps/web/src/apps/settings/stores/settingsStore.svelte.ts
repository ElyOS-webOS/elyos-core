/**
 * Settings alkalmazás store
 *
 * Ez egy példa alkalmazás-specifikus store-ra, amely a Settings alkalmazás
 * állapotát kezeli.
 */

interface SettingsState {
	activeTab: string;
	isDirty: boolean;
	isLoading: boolean;
}

const initialState: SettingsState = {
	activeTab: 'general',
	isDirty: false,
	isLoading: false
};

export class SettingsManager {
	state = $state<SettingsState>({ ...initialState });

	setActiveTab(tab: string) {
		this.state.activeTab = tab;
	}

	setDirty(isDirty: boolean) {
		this.state.isDirty = isDirty;
	}

	setLoading(isLoading: boolean) {
		this.state.isLoading = isLoading;
	}

	reset() {
		this.state = { ...initialState };
	}
}

/**
 * Settings manager példány létrehozása
 */
export function createSettingsManager(): SettingsManager {
	return new SettingsManager();
}
