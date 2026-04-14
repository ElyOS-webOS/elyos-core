/**
 * Todo List Plugin — Entry point
 *
 * Demonstrates DataService CRUD operations with MockWebOSSDK for standalone development.
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
					title: 'Todo List',
					add_placeholder: 'What needs to be done?',
					add_button: 'Add',
					empty: 'No todos yet. Add one above!',
					completed: 'completed',
					remaining: 'remaining',
					clear_completed: 'Clear completed',
					todo_added: 'Todo added',
					todo_removed: 'Todo removed',
					todo_completed: 'Todo completed',
					todo_uncompleted: 'Todo uncompleted',
					cleared: 'Completed todos cleared',
					filter_all: 'All',
					filter_active: 'Active',
					filter_done: 'Done'
				},
				hu: {
					title: 'Teendők',
					add_placeholder: 'Mi a teendő?',
					add_button: 'Hozzáadás',
					empty: 'Nincs még teendő. Adj hozzá egyet!',
					completed: 'kész',
					remaining: 'hátralévő',
					clear_completed: 'Készek törlése',
					todo_added: 'Teendő hozzáadva',
					todo_removed: 'Teendő törölve',
					todo_completed: 'Teendő kész',
					todo_uncompleted: 'Teendő visszaállítva',
					cleared: 'Kész teendők törölve',
					filter_all: 'Összes',
					filter_active: 'Aktív',
					filter_done: 'Kész'
				}
			}
		},
		context: {
			pluginId: 'todo-list',
			user: { id: 'dev-user', name: 'Developer', email: 'dev@localhost', roles: [], groups: [] },
			permissions: ['database', 'notifications']
		}
	});
}

export default function createPlugin() {
	return {
		tagName: 'todo-list-plugin',
		component: App
	};
}

if (typeof window !== 'undefined') {
	(window as any).todo_list_Plugin = createPlugin;
}
