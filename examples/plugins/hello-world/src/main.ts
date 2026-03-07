/**
 * Plugin entry point — registers the Web Component
 *
 * Ez a plugin a WebOS AppLayout rendszerét használja.
 * A komponensek a menu.json alapján töltődnek be dinamikusan.
 */
import { MockWebOSSDK } from '@elyos/sdk/dev';
import App from './App.svelte';

// Initialize Mock SDK for standalone development
if (typeof window !== 'undefined' && !window.webOS) {
	MockWebOSSDK.initialize({
		i18n: {
			locale: 'en',
			translations: {
				en: {
					title: 'Hello World Plugin',
					subtitle: 'ElyOS SDK Demo',
					welcome: 'Welcome to the Hello World plugin!'
				},
				hu: {
					title: 'Hello World Plugin',
					subtitle: 'ElyOS SDK Demo',
					welcome: 'Üdvözöljük a Hello World pluginban!'
				}
			}
		},
		context: {
			pluginId: 'hello-world',
			user: { id: 'dev-user', name: 'Developer', email: 'dev@localhost', roles: [], groups: [] },
			permissions: ['database', 'notifications', 'remote_functions']
		}
	});
}

// Export a factory function that creates the component wrapper
export default function createPlugin() {
	return {
		tagName: 'hello-world-plugin',
		component: App
	};
}

// Expose on window for IIFE usage
if (typeof window !== 'undefined') {
	(window as any).hello_world_Plugin = createPlugin;
}
