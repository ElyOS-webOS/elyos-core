<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import type { TaskbarPosition, TaskbarStyle } from '$lib/constants';
	import type { TaskbarSettings } from '$lib/types/settings';
	import { getContext } from 'svelte';
	import { updateSettings } from '../settings.remote';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { UniversalIcon } from '$lib/components/shared';
	import { useI18n } from '$lib/i18n/hooks';

	// Ikonok
	import { Space, PanelBottom, PanelTop } from 'lucide-svelte';

	interface Props {
		// Jövőbeli props-ok ide kerülnek
	}

	let {}: Props = $props();

	// i18n
	const { t } = useI18n();

	// Settings objektum a kontextusból
	const settings = getContext<{
		taskbar: TaskbarSettings;
	}>('settings');

	// Tálca pozíció változtatása
	async function handleTaskbarPositionChange(position: TaskbarPosition) {
		try {
			const result = await updateSettings({
				taskbar: {
					position: position
				}
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.taskbar.position.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Tálca stílus változtatása
	async function handleTaskbarStyleChange(style: TaskbarStyle) {
		try {
			const result = await updateSettings({
				taskbar: {
					style: style
				}
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.taskbar.style.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Tálca elem láthatóság változtatása
	async function handleItemVisibilityChange(key: string, checked: boolean) {
		try {
			const result = await updateSettings({
				taskbar: {
					itemVisibility: {
						...settings.taskbar.itemVisibility,
						[key]: checked
					}
				}
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.taskbar.items.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Elem címkék és leírások - i18n kulcsok alapján
	function getItemInfo(key: string): { label: string; description: string; icon: string } {
		const icons: Record<string, string> = {
			clock: 'Clock',
			themeSwitcher: 'SwatchBook',
			appGuidLink: 'CopyPlus',
			messages: 'MessageSquare',
			notifications: 'Bell'
		};
		return {
			label: t(`settings.taskbar.items.${key}.label`),
			description: t(`settings.taskbar.items.${key}.description`),
			icon: icons[key] || 'Circle'
		};
	}
</script>

<h2>{t('settings.taskbar.title')}</h2>

<ContentSection
	title={t('settings.taskbar.position.label')}
	description={t('settings.taskbar.position.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.taskbar.position.info')}
	{/snippet}
	<div class="button-groups">
		<Button
			variant={settings.taskbar.position === 'top' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleTaskbarPositionChange('top')}
		>
			<PanelTop size={14} />
			{t('settings.taskbar.position.top')}
		</Button>
		<Button
			variant={settings.taskbar.position === 'bottom' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleTaskbarPositionChange('bottom')}
		>
			<PanelBottom size={14} />
			{t('settings.taskbar.position.bottom')}
		</Button>
	</div>
</ContentSection>

<ContentSection
	title={t('settings.taskbar.style.label')}
	description={t('settings.taskbar.style.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.taskbar.style.info')}
	{/snippet}
	<div class="button-groups">
		<Button
			variant={settings.taskbar.style === 'classic' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleTaskbarStyleChange('classic')}
		>
			<PanelBottom size={14} />
			{t('settings.taskbar.style.classic')}
		</Button>
		<Button
			variant={settings.taskbar.style === 'modern' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleTaskbarStyleChange('modern')}
		>
			<Space size={14} />
			{t('settings.taskbar.style.modern')}
		</Button>
	</div>
</ContentSection>
<ContentSection
	title={t('settings.taskbar.items.label')}
	description={t('settings.taskbar.items.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.taskbar.items.info')}
	{/snippet}
	<div class="taskbar-items">
		{#each Object.entries(settings.taskbar.itemVisibility) as [key, value]}
			{@const itemInfo = getItemInfo(key)}
			<div class="taskbar-item">
				<div class="item-icon"><UniversalIcon icon={itemInfo.icon} size={18} /></div>
				<div class="item-content">
					<span class="item-label">{itemInfo.label}</span>
					<span class="item-description">{itemInfo.description}</span>
				</div>
				<Switch
					checked={value}
					onCheckedChange={(checked) => handleItemVisibilityChange(key, checked)}
				/>
			</div>
		{/each}
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

	/* Tálca elemek lista */
	.taskbar-items {
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		width: 100%;
	}

	.taskbar-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		transition:
			box-shadow 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;

		border: 2px solid hsl(var(--border));
		border-radius: 0.875rem;
		background: oklch(from var(--popover) l c h / 0.3);
		padding: 0.8rem 1rem;
	}

	/*.taskbar-item:hover {
		transform: translateY(-1px);
		box-shadow:
			0 4px 8px 0 rgb(0 0 0 / 0.12),
			0 2px 4px -1px rgb(0 0 0 / 0.12);
		border-color: hsl(var(--primary) / 0.4);
	}*/

	.item-content {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.item-label {
		color: hsl(var(--foreground));
		font-weight: 600;
		font-size: 80%;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.item-description {
		opacity: 0.85;
		color: hsl(var(--muted-foreground));
		font-style: italic;
		font-size: 70%;
		line-height: 1.4;
	}
</style>
