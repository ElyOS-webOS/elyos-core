<script lang="ts">
	/**
	 * AuthLocaleSwitcher Component
	 *
	 * Minimalista nyelvváltó az auth oldalakhoz.
	 * Egyszerű, halvány szürke gombok egymás mellett.
	 * Ha csak egy nyelv támogatott, nem jelenik meg.
	 */

	import { getI18nService } from '../service.js';
	import { getTranslationStore } from '../store.svelte.js';
	import { setLocalePreference } from '../preference.remote.js';
	import { withTimeout } from '$lib/utils/remote';
	import { invalidate } from '$app/navigation';
	import type { LocaleConfig } from '../types.js';

	const i18nService = getI18nService();
	const store = getTranslationStore();

	let isSaving = $state(false);

	let currentLocale = $derived(store.currentLocale);
	let supportedLocales = $derived(store.supportedLocales);
	let showSwitcher = $derived(supportedLocales.length > 1);

	async function handleLocaleChange(locale: string) {
		if (locale === currentLocale || isSaving) return;

		isSaving = true;
		try {
			const result = await withTimeout(setLocalePreference({ locale }));

			if (result?.success) {
				await i18nService.setLocale(locale, false);
				// Invalidáljuk a settings-et és az i18n:locale dependency-t
				await Promise.all([invalidate('app:settings'), invalidate('i18n:locale')]);
			}
		} catch (error) {
			console.error('Locale change error:', error);
		} finally {
			isSaving = false;
		}
	}
</script>

{#if showSwitcher}
	<div class="auth-locale-switcher">
		{#each supportedLocales as locale, i (locale.code)}
			{#if i > 0}
				<span class="separator">|</span>
			{/if}
			<button
				type="button"
				class="locale-btn"
				class:active={locale.code === currentLocale}
				onclick={() => handleLocaleChange(locale.code)}
				disabled={isSaving}
			>
				{locale.code.toUpperCase()}
			</button>
		{/each}
	</div>
{/if}

<style>
	.auth-locale-switcher {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.separator {
		color: #d1d5db;
		font-size: 0.75rem;
	}

	.locale-btn {
		transition: color 0.15s ease;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0.125rem 0.25rem;
		color: #9ca3af;
		font-weight: 500;
		font-size: 0.75rem;
		letter-spacing: 0.025em;
	}

	.locale-btn:hover:not(:disabled) {
		color: #6b7280;
	}

	.locale-btn.active {
		color: #374151;
	}

	.locale-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
