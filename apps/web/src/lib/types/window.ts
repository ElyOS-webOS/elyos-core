export interface WindowSize {
	width: number;
	height: number;
	/** Whether the window should open maximized. */
	maximized?: boolean;
}

export interface AppMetadata {
	/** Application name. */
	appName: string;
	/** Application title. */
	title: string;
	/** Default window size. */
	defaultSize: WindowSize;
	/** Icon identifier. */
	icon?: string;
	/** Icon display style: 'icon' (centered with padding) or 'cover' (fills entire area). */
	iconStyle?: 'icon' | 'cover';
	/** Application category. */
	category?: string;
	/** Whether multiple instances are allowed. */
	allowMultiple?: boolean;
	/** Minimum window size. */
	minSize?: WindowSize;
	/** Maximum window size. */
	maxSize?: WindowSize;
	/** Whether window is resizable. */
	resizable?: boolean;
	/** Whether window can be maximized. */
	maximizable?: boolean;
	/** Whether window can be minimized. */
	minimizable?: boolean;
	/** Help ID for the application. */
	helpId?: number;
	parameters?: AppParameters;
}

/** Parameters that can be passed to an app when opening. */
export interface AppParameters {
	[key: string]: unknown;
}
