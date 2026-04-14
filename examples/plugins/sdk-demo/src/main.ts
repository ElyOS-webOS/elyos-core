/**
 * Plugin entry point — registers the Web Component
 *
 * Ez a plugin a WebOS AppLayout rendszerét használja.
 * A komponensek a menu.json alapján töltődnek be dinamikusan.
 */
import { MockWebOSSDK } from '@racona/sdk/dev';
import App from './App.svelte';

// Initialize Mock SDK for standalone development
if (typeof window !== 'undefined' && !window.webOS) {
	MockWebOSSDK.initialize({
		i18n: {
			locale: 'en',
			translations: {
				en: {
					title: 'SDK Demo',
					subtitle: 'Racona SDK Demo',
					welcome: 'Welcome to the SDK Demo!'
				},
				hu: {
					title: 'SDK Demo',
					subtitle: 'Racona SDK Demo',
					welcome: 'Üdvözöljük az SDK Demo alkalmazásban!'
				}
			}
		},
		context: {
			pluginId: 'sdk-demo',
			user: { id: 'dev-user', name: 'Developer', email: 'dev@localhost', roles: [], groups: [] },
			permissions: ['database', 'notifications', 'remote_functions']
		}
	});
}

// Export a factory function that creates the component wrapper
export default function createPlugin() {
	return {
		tagName: 'sdk-demo-plugin',
		component: App
	};
}

// Expose on window for IIFE usage
if (typeof window !== 'undefined') {
	(window as any).sdk_demo_Plugin = createPlugin;
}
