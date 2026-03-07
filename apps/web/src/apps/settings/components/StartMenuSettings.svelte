<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
	import { I18nProvider } from '$lib/i18n/components';
	import { useI18n } from '$lib/i18n/hooks';
	import { Button } from '$lib/components/ui/button';
	import type { StartMenuViewMode } from '$lib/constants';
	import type { StartMenuSettings } from '$lib/types/settings';
	import { getContext } from 'svelte';
	import { updateSettings } from '../settings.remote';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { LayoutGrid, List } from 'lucide-svelte';

	const { t } = useI18n();

	// Settings objektum a kontextusból
	const settings = getContext<{
		startMenu: StartMenuSettings;
	}>('settings');

	// Start menü nézet mód változtatása
	async function handleViewModeChange(viewMode: StartMenuViewMode) {
		try {
			const result = await updateSettings({
				startMenu: {
					viewMode: viewMode
				}
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.startmenu.viewMode.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			toast.error(t('common.errors.saveFailed'));
		}
	}
</script>

<I18nProvider namespaces={['settings']}>
	<h2>{t('settings.startmenu.title')}</h2>

	<ContentSection
		title={t('settings.startmenu.viewMode.label')}
		description={t('settings.startmenu.viewMode.description')}
		contentPosition="bottom"
	>
		{#snippet info()}
			<p>{t('settings.startmenu.viewMode.info')}</p>
		{/snippet}
		<div class="button-groups">
			<Button
				variant={settings.startMenu.viewMode === 'grid' ? 'default' : 'outline'}
				size="sm"
				onclick={() => handleViewModeChange('grid')}
			>
				<LayoutGrid size={14} />
				{t('settings.startmenu.viewMode.grid')}
			</Button>
			<Button
				variant={settings.startMenu.viewMode === 'list' ? 'default' : 'outline'}
				size="sm"
				onclick={() => handleViewModeChange('list')}
			>
				<List size={14} />
				{t('settings.startmenu.viewMode.list')}
			</Button>
		</div>
	</ContentSection>
</I18nProvider>

<style>
	/* Gomb csoport */
	.button-groups {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.button-groups :global(button) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
