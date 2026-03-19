/**
 * Mock Context Service
 *
 * Mock plugin kontextus és ablak vezérlők.
 */

import type { ContextService, UserInfo, WindowControls } from '../../types/index.js';

export interface MockContextConfig {
	/** Plugin ID to use in mock context (default: `"dev-plugin"`) */
	pluginId?: string;
	/** Partial user info to override mock defaults */
	user?: Partial<UserInfo>;
	/** Parameters passed to the app on launch */
	params?: Record<string, unknown>;
	/** Permissions granted to the app (default: `["database", "notifications", "remote_functions"]`) */
	permissions?: string[];
}

export class MockContextService implements ContextService {
	/** Plugin egyedi azonosítója */
	readonly pluginId: string;
	/** Bejelentkezett felhasználó adatai (mock) */
	readonly user: UserInfo;
	/** Plugin indításkor átadott paraméterek */
	readonly params: Record<string, unknown>;
	/** Plugin jogosultságok listája */
	readonly permissions: string[];
	/** Ablak vezérlők — console-ra logolnak */
	readonly window: WindowControls;

	/** @param config - Opcionális mock kontextus konfiguráció */
	constructor(config?: MockContextConfig) {
		this.pluginId = config?.pluginId ?? 'dev-plugin';
		this.user = {
			id: 'mock-user-1',
			name: 'Dev User',
			email: 'dev@example.com',
			roles: ['admin'],
			groups: [],
			...config?.user
		};
		this.params = config?.params ?? {};
		this.permissions = config?.permissions ?? ['database', 'notifications', 'remote_functions'];
		this.window = {
			close: () => console.log('[Mock Window] close()'),
			setTitle: (title: string) => {
				console.log(`[Mock Window] setTitle("${title}")`);
				if (typeof document !== 'undefined') {
					document.title = title;
				}
			}
		};
	}
}
