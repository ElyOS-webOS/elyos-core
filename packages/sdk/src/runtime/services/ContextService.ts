/**
 * Context Service
 *
 * Plugin kontextus információk és ablak vezérlők.
 */

import type {
	ContextService as IContextService,
	UserInfo,
	WindowControls
} from '../../types/index.js';

export class ContextService implements IContextService {
	readonly pluginId: string;
	readonly user: UserInfo;
	readonly params: Record<string, unknown>;
	readonly permissions: string[];
	readonly window: WindowControls;

	constructor(
		pluginId: string,
		user: UserInfo,
		params: Record<string, unknown>,
		permissions: string[],
		windowElement?: Window
	) {
		this.pluginId = pluginId;
		this.user = user;
		this.params = params;
		this.permissions = permissions;

		this.window = {
			close: () => {
				if (windowElement) {
					windowElement.close();
				} else if (typeof globalThis.window !== 'undefined') {
					globalThis.window.dispatchEvent(
						new CustomEvent('plugin:close', { detail: { pluginId } })
					);
				}
			},
			setTitle: (title: string) => {
				if (windowElement) {
					windowElement.document.title = title;
				} else if (typeof globalThis.window !== 'undefined') {
					globalThis.window.dispatchEvent(
						new CustomEvent('plugin:setTitle', { detail: { pluginId, title } })
					);
				}
			}
		};
	}
}
