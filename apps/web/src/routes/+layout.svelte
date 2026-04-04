<!--
  Root Layout

  Initializes the i18n service on the client side with the locale from the server.

  Requirements: 5.4
-->
<script lang="ts">
	import './admin/appAdmin.css';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getI18nService, setDatabaseLoader } from '$lib/i18n';
	import { getTranslations } from '$lib/i18n/translations.remote';
	import { withTimeout } from '$lib/utils/remote';
	import { I18nDevTools } from '$lib/i18n/components';

	let { children, data } = $props();

	let i18nReady = $state(!browser); // SSR-nél azonnal ready

	// Initialize i18n on the client side
	onMount(async () => {
		if (!browser) return;

		try {
			const locale = data.locale;
			const i18nService = getI18nService();

			// Database loader beállítása kliens oldalon
			setDatabaseLoader(async (locale, namespace) => {
				return await withTimeout(getTranslations({ locale, namespace }));
			});

			await i18nService.init({
				defaultLocale: locale,
				fallbackLocale: 'hu'
			});

			// Preload common namespaces
			await Promise.all([
				i18nService.loadNamespace('common'),
				i18nService.loadNamespace('errors'),
				i18nService.loadNamespace('validation')
			]);

			i18nReady = true;
		} catch (error) {
			console.error('[Client] Failed to initialize i18n:', error);
			i18nReady = true; // Hiba esetén is engedjük tovább
		}
	});
</script>

{#if i18nReady}
	{@render children()}
{/if}

<!-- I18n fejlesztői eszközök - csak dev módban jelenik meg -->
<I18nDevTools />
