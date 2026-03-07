<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { DesktopClickMode } from '$lib/constants';
	import type { DesktopSettings } from '$lib/types/settings';
	import { getContext } from 'svelte';
	import { updateSettings } from '../settings.remote';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { useI18n } from '$lib/i18n/hooks';

	// Ikonok
	import { MousePointerClick, MousePointer2 } from 'lucide-svelte';

	interface Props {
		// Jövőbeli props-ok ide kerülnek
	}

	let {}: Props = $props();

	// i18n
	const { t } = useI18n();

	// Settings objektum a kontextusból
	const settings = getContext<{
		desktop: DesktopSettings;
	}>('settings');

	// Kattintási mód változtatása
	async function handleClickModeChange(mode: DesktopClickMode) {
		try {
			const result = await updateSettings({
				desktop: {
					clickMode: mode
				}
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.desktop.clickMode.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			toast.error(t('common.errors.saveFailed'));
		}
	}
</script>

<h2>{t('settings.desktop.title')}</h2>

<ContentSection
	title={t('settings.desktop.clickMode.label')}
	description={t('settings.desktop.clickMode.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.desktop.clickMode.info')}
	{/snippet}
	<div class="button-groups">
		<Button
			variant={settings.desktop.clickMode === 'single' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleClickModeChange('single')}
		>
			<MousePointerClick size={14} />
			{t('settings.desktop.clickMode.single')}
		</Button>
		<Button
			variant={settings.desktop.clickMode === 'double' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleClickModeChange('double')}
		>
			<MousePointer2 size={14} />
			{t('settings.desktop.clickMode.double')}
		</Button>
	</div>
</ContentSection>

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
