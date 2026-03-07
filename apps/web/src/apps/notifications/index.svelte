<script lang="ts">
	import { setContext } from 'svelte';
	import { createAppShell, APP_SHELL_CONTEXT_KEY } from '$lib/apps/appShell.svelte';
	import { createActionBar } from '$lib/apps/actionBar.svelte';
	import { I18nProvider } from '$lib/i18n/components';
	import { getAppContext } from '$lib/services/client/appContext';
	import NotificationList from './components/NotificationList.svelte';
	import NotificationDetail from './components/NotificationDetail.svelte';

	// Create a minimal app shell without menu
	const shell = createAppShell({
		appName: 'notifications',
		menuData: []
	});

	// Set shell context for child components
	setContext(APP_SHELL_CONTEXT_KEY, shell);

	// Create action bar context
	const actionBar = createActionBar();

	// Get app context to access parameters
	const appContext = getAppContext();

	const currentView = $derived(shell.activeComponent);
	const params = $derived(shell.componentProps);

	// Check if notificationId is passed as parameter and navigate to detail view
	$effect(() => {
		const notificationId = appContext?.parameters?.notificationId;
		if (notificationId && typeof notificationId === 'number') {
			shell.navigateTo('NotificationDetail', { notificationId });
		}
	});
</script>

<I18nProvider namespaces={['notifications', 'common']}>
	<div class="app-container">
		<div class="app-content custom-scrollbar">
			{#if currentView === 'NotificationDetail' && typeof params.notificationId === 'number'}
				<NotificationDetail notificationId={params.notificationId} />
			{:else}
				<NotificationList />
			{/if}
		</div>
		{#if actionBar.content}
			<div class="app-action-bar">
				{@render actionBar.content()}
			</div>
		{/if}
	</div>
</I18nProvider>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		height: 100%;
		overflow: hidden;
	}

	.app-content {
		flex: 1;
		padding: 0 1.5rem 1rem 0.5rem;
		overflow-y: auto;
	}

	.app-content :global {
		.title-block {
			margin-bottom: 2rem;
		}

		.title-block h2 {
			margin-bottom: 0;
			color: var(--color-neutral-900);
			font-weight: 600;
			font-size: 1.5rem;
			letter-spacing: -0.025em;
		}

		.title-block h3 {
			color: var(--color-neutral-500);
			font-size: 90%;
		}
	}

	:global(.dark) .app-content :global {
		.title-block h2 {
			color: var(--color-neutral-300);
		}
	}

	/* Use global action bar styles from AppLayout */
	.app-action-bar {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.5rem;
		border-radius: var(--radius-md);
		background: var(--color-neutral-100);
		padding: 0.625rem 1rem;
	}

	:global(.dark) .app-action-bar {
		background: var(--color-neutral-800);
	}
</style>
