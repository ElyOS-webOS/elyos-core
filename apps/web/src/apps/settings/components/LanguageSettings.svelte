<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
	import { I18nProvider, LocaleSwitcher } from '$lib/i18n/components';
	import { useI18n } from '$lib/i18n/hooks';

	const { t, store } = useI18n();

	let currentLocale = $derived(store.currentLocale);
	let currentLocaleConfig = $derived(store.supportedLocales.find((l) => l.code === currentLocale));
</script>

<I18nProvider namespaces={['settings']}>
	<h2>{t('settings.language.title')}</h2>

	<ContentSection
		title={t('settings.language.select.label')}
		description={t('settings.language.select.description')}
		contentPosition="bottom"
	>
		<div class="language-selector">
			<LocaleSwitcher variant="buttons" showFullName={true} size="default" />
		</div>

		{#snippet info()}
			<p>{t('settings.language.info')}</p>
			{#if currentLocaleConfig}
				<p class="current-language">
					{t('settings.general.languageRegion.title')}:
					<strong>{currentLocaleConfig.nativeName}</strong>
					({currentLocaleConfig.name})
				</p>
			{/if}
		{/snippet}
	</ContentSection>
</I18nProvider>

<style>
	.language-selector {
		margin-top: 1rem;
		width: 100%;
	}

	.language-selector :global(.flex) {
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.current-language {
		margin-top: 0.75rem;
		border-top: 1px solid var(--color-neutral-200);
		padding-top: 0.75rem;
	}

	:global(.dark) .current-language {
		border-top-color: var(--color-neutral-700);
	}
</style>
