/**
 * Mock Context Service
 *
 * Mock plugin kontextus és ablak vezérlők.
 */

import type { ContextService, UserInfo, WindowControls } from '../../types/index.js';

export interface MockContextConfig {
	pluginId?: string;
	user?: Partial<UserInfo>;
	params?: Record<string, unknown>;
	permissions?: string[];
}

export class MockContextService implements ContextService {
	readonly pluginId: string;
	readonly user: UserInfo;
	readonly params: Record<string, unknown>;
	readonly permissions: string[];
	readonly window: WindowControls;

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
