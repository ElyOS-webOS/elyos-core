<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ColorHuePicker from '$lib/components/ui/ColorHuePicker.svelte';
	import { toast } from 'svelte-sonner';
	import { updateSettings } from '../settings.remote';
	import { getThemePresets } from '../theme-presets.remote';
	import { getContext, onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import type { ThemeMode, FontSize } from '$lib/types/theme';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { useI18n } from '$lib/i18n/hooks';
	import ContentSection from '$lib/components/shared/ContentSection.svelte';

	// Ikonok
	import Type from 'lucide-svelte/icons/type';
	import Check from 'lucide-svelte/icons/check';
	import Palette from 'lucide-svelte/icons/palette';
	import ImageIcon from 'lucide-svelte/icons/image';
	import VideoIcon from 'lucide-svelte/icons/video';

	// i18n
	const { t, locale } = useI18n();

	// Settings objektum a kontextusból
	const settings = getContext<{
		theme: {
			mode: ThemeMode;
			modeTaskbarStartMenu: ThemeMode;
			colorPrimaryHue: string;
			fontSize: FontSize;
		};
	}>('settings');

	// Theme presets state
	let themePresets = $state<
		Array<{
			id: number;
			locale: string;
			name: string;
			description: string | null;
			settings: {
				theme: {
					mode: ThemeMode;
					modeTaskbarStartMenu: ThemeMode;
					colorPrimaryHue: string;
					fontSize: FontSize;
				};
				background?: {
					type?: 'image' | 'video' | 'color';
					value?: string;
				};
			};
			isDefault: boolean | null;
			sortOrder: number;
			createdAt: Date | null;
			updatedAt: Date | null;
		}>
	>([]);
	let isLoadingPresets = $state(false);

	// Load theme presets on mount
	onMount(async () => {
		await loadThemePresets();
	});

	// Load theme presets from database
	async function loadThemePresets() {
		isLoadingPresets = true;
		try {
			themePresets = await getThemePresets({ locale });
		} catch (error) {
			console.error('Failed to load theme presets:', error);
			toast.error(t('settings.appearance.presets.loadFailed'));
		} finally {
			isLoadingPresets = false;
		}
	}

	// Apply theme preset
	async function applyThemePreset(preset: (typeof themePresets)[0]) {
		try {
			const result = await updateSettings(preset.settings);
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.appearance.presets.applied', { name: preset.name }));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			console.error('Theme preset apply error:', error);
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Desktop téma mód változtatása
	async function handleThemeModeChange(newMode: ThemeMode) {
		try {
			// Desktop mód változtatásakor a taskbar mód is automatikusan követi
			const result = await updateSettings({
				theme: {
					mode: newMode,
					modeTaskbarStartMenu: newMode
				}
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.appearance.themeMode.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			console.error('Theme mode update error:', error);
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Taskbar mód változtatása
	async function handleTaskbarModeChange(newMode: ThemeMode) {
		try {
			const result = await updateSettings({
				theme: { modeTaskbarStartMenu: newMode }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.appearance.taskbarMode.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			console.error('Taskbar mode update error:', error);
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Betűméret változtatása
	async function handleFontSizeChange(newSize: FontSize) {
		try {
			const result = await updateSettings({
				theme: { fontSize: newSize }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.appearance.fontSize.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			console.error('Font size update error:', error);
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Szín változtatása
	async function handleColorChange(newHue: number) {
		try {
			const result = await updateSettings({
				theme: { colorPrimaryHue: newHue.toString() }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success(t('settings.appearance.colors.saved'));
			} else {
				toast.error(t('common.errors.saveFailed'));
			}
		} catch (error) {
			console.error('Color update error:', error);
			toast.error(t('common.errors.saveFailed'));
		}
	}

	// Preset háttér stílus generálása
	function getPresetBackgroundStyle(preset: (typeof themePresets)[0]): string {
		const bg = preset.settings.background;
		if (!bg?.type || !bg?.value) {
			// Nincs háttér beállítás — alapértelmezett gradiens
			return '';
		}

		switch (bg.type) {
			case 'color':
				return `background: ${bg.value};`;
			case 'image': {
				const thumbUrl = `/api/files/backgrounds/shared/image/thumb-${bg.value}`;
				return `background-image: url('${thumbUrl}'); background-size: cover; background-position: center;`;
			}
			case 'video': {
				const nameWithoutExt = bg.value.replace(/\.[^.]+$/, '');
				const thumbUrl = `/api/files/backgrounds/shared/video/thumb-${nameWithoutExt}.jpg`;
				return `background-image: url('${thumbUrl}'); background-size: cover; background-position: center;`;
			}
			default:
				return '';
		}
	}
</script>

<h2>{t('settings.appearance.title')}</h2>

<!-- Theme Presets Szekció -->
<ContentSection
	title={t('settings.appearance.presets.label')}
	description={t('settings.appearance.presets.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.appearance.presets.info')}
	{/snippet}

	{#if isLoadingPresets}
		<div class="presets-loading">
			<p>{t('common.loading')}</p>
		</div>
	{:else if themePresets.length > 0}
		<div class="presets-grid">
			<Tooltip.Provider>
				{#each themePresets as preset (preset.id)}
					{@const bgStyle = getPresetBackgroundStyle(preset)}
					{@const bgType = preset.settings.background?.type}

					<button
						class="preset-card"
						class:has-background={!!bgStyle}
						onclick={() => applyThemePreset(preset)}
						style={bgStyle}
					>
						<div class="preset-indicators">
							<Tooltip.Root>
								<Tooltip.Trigger>
									<div
										class="preset-mode"
										class:light={preset.settings.theme.mode === 'light'}
										class:dark={preset.settings.theme.mode === 'dark'}
										class:auto={preset.settings.theme.mode === 'auto'}
									></div>
								</Tooltip.Trigger>
								<Tooltip.Content>{t('settings.appearance.preset.mode')}</Tooltip.Content>
							</Tooltip.Root>
							<Tooltip.Root>
								<Tooltip.Trigger>
									<div
										class="preset-color"
										style="--hue: {preset.settings.theme.colorPrimaryHue}deg"
									></div>
								</Tooltip.Trigger>
								<Tooltip.Content>{t('settings.appearance.preset.color')}</Tooltip.Content>
							</Tooltip.Root>

							{#if bgType}
								<Tooltip.Root>
									<Tooltip.Trigger>
										<div
											class="preset-bg-type"
											class:on-image={bgType === 'image' || bgType === 'video'}
										>
											{#if bgType === 'color'}
												<Palette size={16} />
											{:else if bgType === 'image'}
												<ImageIcon size={16} />
											{:else if bgType === 'video'}
												<VideoIcon size={16} />
											{/if}
										</div>
									</Tooltip.Trigger>
									<Tooltip.Content>{t('settings.appearance.preset.background')}</Tooltip.Content>
								</Tooltip.Root>
							{/if}
						</div>
						<div class="preset-info">
							<h3 class="preset-name">{preset.name}</h3>
							{#if preset.description}
								<p class="preset-desc">{preset.description}</p>
							{/if}
						</div>
						{#if settings.theme.mode === preset.settings.theme.mode && settings.theme.colorPrimaryHue === preset.settings.theme.colorPrimaryHue && settings.theme.fontSize === preset.settings.theme.fontSize}
							<div class="preset-active-badge">
								<Check size={16} />
							</div>
						{/if}
					</button>
				{/each}
			</Tooltip.Provider>
		</div>
	{/if}
</ContentSection>

<!-- Desktop Mód Szekció -->
<ContentSection
	title={t('settings.appearance.desktopTheme.label')}
	description={t('settings.appearance.desktopTheme.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.appearance.desktopTheme.info')}
	{/snippet}

	<Tooltip.Provider delayDuration={200}>
		<div class="theme-mode-swatches">
			<!-- Világos mód -->

			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						class="theme-swatch light-swatch"
						class:active={settings.theme.mode === 'light'}
						onclick={() => handleThemeModeChange('light')}
						aria-label={t('settings.appearance.themeMode.light')}
						type="button"
					>
						{#if settings.theme.mode === 'light'}
							<span class="checkmark">✓</span>
						{/if}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content>{t('settings.appearance.themeMode.light')}</Tooltip.Content>
			</Tooltip.Root>

			<!-- Sötét mód -->

			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						class="theme-swatch dark-swatch"
						class:active={settings.theme.mode === 'dark'}
						onclick={() => handleThemeModeChange('dark')}
						aria-label={t('settings.appearance.themeMode.dark')}
						type="button"
					>
						{#if settings.theme.mode === 'dark'}
							<span class="checkmark">✓</span>
						{/if}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content>{t('settings.appearance.themeMode.dark')}</Tooltip.Content>
			</Tooltip.Root>

			<!-- Automatikus mód -->

			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						class="theme-swatch auto-swatch"
						class:active={settings.theme.mode === 'auto'}
						onclick={() => handleThemeModeChange('auto')}
						aria-label={t('settings.appearance.themeMode.auto')}
						type="button"
					>
						{#if settings.theme.mode === 'auto'}
							<span class="checkmark">✓</span>
						{/if}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content>{t('settings.appearance.themeMode.auto')}</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</Tooltip.Provider>
</ContentSection>

<!-- Taskbar Mód Szekció -->
<ContentSection
	title={t('settings.appearance.taskbarTheme.label')}
	description={t('settings.appearance.taskbarTheme.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.appearance.taskbarTheme.info')}
	{/snippet}

	<Tooltip.Provider delayDuration={200}>
		<div class="theme-mode-swatches">
			<!-- Világos mód -->
			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						class="theme-swatch light-swatch"
						class:active={settings.theme.modeTaskbarStartMenu === 'light'}
						onclick={() => handleTaskbarModeChange('light')}
						aria-label={t('settings.appearance.themeMode.light')}
						type="button"
					>
						{#if settings.theme.modeTaskbarStartMenu === 'light'}
							<span class="checkmark">✓</span>
						{/if}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content>{t('settings.appearance.themeMode.light')}</Tooltip.Content>
			</Tooltip.Root>

			<!-- Sötét mód -->
			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						class="theme-swatch dark-swatch"
						class:active={settings.theme.modeTaskbarStartMenu === 'dark'}
						onclick={() => handleTaskbarModeChange('dark')}
						aria-label={t('settings.appearance.themeMode.dark')}
						type="button"
					>
						{#if settings.theme.modeTaskbarStartMenu === 'dark'}
							<span class="checkmark">✓</span>
						{/if}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content>{t('settings.appearance.themeMode.dark')}</Tooltip.Content>
			</Tooltip.Root>

			<!-- Automatikus mód -->
			<Tooltip.Root>
				<Tooltip.Trigger>
					<button
						class="theme-swatch auto-swatch"
						class:active={settings.theme.modeTaskbarStartMenu === 'auto'}
						onclick={() => handleTaskbarModeChange('auto')}
						aria-label={t('settings.appearance.themeMode.auto')}
						type="button"
					>
						{#if settings.theme.modeTaskbarStartMenu === 'auto'}
							<span class="checkmark">✓</span>
						{/if}
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content>{t('settings.appearance.themeMode.auto')}</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</Tooltip.Provider>
</ContentSection>

<!-- Színek Szekció -->
<ContentSection
	title={t('settings.appearance.colors.label')}
	description={t('settings.appearance.colors.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.appearance.colors.info')}
	{/snippet}

	<ColorHuePicker
		currentHue={parseInt(settings.theme.colorPrimaryHue)}
		onHueChange={handleColorChange}
	/>
</ContentSection>

<!-- Betűméret Szekció -->
<ContentSection
	title={t('settings.appearance.fontSize.label')}
	description={t('settings.appearance.fontSize.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.appearance.fontSize.info')}
	{/snippet}

	<div class="font-size-buttons">
		<Button
			variant={settings.theme.fontSize === 'small' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleFontSizeChange('small')}
		>
			<Type size={14} />
			{t('settings.appearance.fontSize.small')}
		</Button>
		<Button
			variant={settings.theme.fontSize === 'medium' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleFontSizeChange('medium')}
		>
			<Type size={16} />
			{t('settings.appearance.fontSize.medium')}
		</Button>
		<Button
			variant={settings.theme.fontSize === 'large' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleFontSizeChange('large')}
		>
			<Type size={18} />
			{t('settings.appearance.fontSize.large')}
		</Button>
	</div>
</ContentSection>

<style>
	/* Beállítási elemek */
	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		container-type: inline-size;
	}

	.setting-label-group {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.375rem;
	}

	.setting-label-group :global(label) {
		color: var(--color-neutral-900);
		font-weight: 600;
		font-size: 1.0625rem;
		letter-spacing: -0.01em;
	}

	:global(.dark) .setting-label-group :global(label) {
		color: var(--color-neutral-100);
	}

	.setting-description {
		margin: 0;
		color: var(--color-neutral-500);
		font-weight: 400;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	/* Információs blokk */
	.info-block {
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--radius-md, 0.375rem);
		background-color: var(--color-neutral-50);
		padding: 0.875rem 1rem;
		color: var(--color-neutral-600);
		font-size: 0.75rem;
		line-height: 1.6;
	}

	:global(.dark) .info-block {
		border-color: var(--color-neutral-800);
		background-color: var(--color-neutral-900);
		color: var(--color-neutral-400);
	}

	.info-block p {
		margin: 0;
	}

	/* Theme Presets */
	.presets-loading {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		color: var(--color-neutral-500);
	}

	.presets-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin-top: 0.5rem;
	}

	@container (max-width: 560px) {
		.presets-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.preset-card {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: flex-end;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 2px solid var(--color-neutral-200);
		border-radius: var(--radius-lg, 0.5rem);
		background-position: center;
		background-size: cover;
		background-color: var(--color-neutral-100);
		padding: 0;
		min-height: 160px;
		overflow: hidden;
		text-align: left;
	}

	:global(.dark) .preset-card {
		border-color: var(--color-neutral-700);
		background-color: var(--color-neutral-800);
	}

	.preset-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
		border-color: var(--color-primary-400);
	}

	:global(.dark) .preset-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		border-color: var(--color-primary-500);
	}

	.preset-card:focus {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.preset-card:focus:not(:focus-visible) {
		outline: none;
	}

	/* Indikátorok középen */
	.preset-indicators {
		display: flex;
		flex: 1;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}

	/* Base indikátor stílus */
	.preset-mode,
	.preset-color,
	.preset-bg-type {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		width: 45px;
		height: 45px;
	}

	.has-background .preset-mode,
	.has-background .preset-color,
	.has-background .preset-bg-type {
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
	}

	/* Desktop mód indikátor */
	.preset-mode {
		border: 2px solid var(--color-neutral-300);
	}

	.preset-mode.light {
		border-color: var(--color-neutral-400);
		background: linear-gradient(135deg, #e5e5e5 0%, #d0d0d0 100%);
	}

	.preset-mode.dark {
		border-color: var(--color-neutral-600);
		background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
	}

	.preset-mode.auto {
		border-color: var(--color-neutral-500);
		background: linear-gradient(90deg, #e5e5e5 0%, #e5e5e5 50%, #1a1a1a 50%, #1a1a1a 100%);
	}

	/* Elsődleges szín indikátor */
	.preset-color {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border: 2px solid rgba(0, 0, 0, 0.1);
		background: oklch(var(--primary-l) var(--primary-c) var(--hue));
	}

	/* Háttér típus indikátor */
	.preset-bg-type {
		border: 2px solid var(--color-neutral-300);
		background: var(--color-neutral-100);
		color: var(--color-neutral-600);
	}

	:global(.dark) .preset-bg-type {
		border-color: var(--color-neutral-600);
		background: var(--color-neutral-800);
		color: var(--color-neutral-300);
	}

	.preset-bg-type.on-image {
		border-color: rgba(255, 255, 255, 0.4);
		background: rgba(0, 0, 0, 0.45);
		color: white;
	}

	:global(.dark) .preset-bg-type.on-image {
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(0, 0, 0, 0.5);
		color: white;
	}

	/* Szöveg sáv alul — átlátszó háttérrel, rendszer módhoz igazodva */
	.preset-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		backdrop-filter: blur(4px);
		background: rgba(255, 255, 255, 0.75);
		padding: 0.625rem 0.75rem;
	}

	:global(.dark) .preset-info {
		background: rgba(0, 0, 0, 0.55);
	}

	.preset-name {
		margin: 0;
		color: var(--color-neutral-900);
		font-weight: 600;
		font-size: 0.875rem;
	}

	:global(.dark) .preset-name {
		color: var(--color-neutral-100);
	}

	.preset-desc {
		margin: 0;
		color: var(--color-neutral-600);
		font-size: 0.6875rem;
		line-height: 1.3;
	}

	:global(.dark) .preset-desc {
		color: var(--color-neutral-400);
	}

	.preset-active-badge {
		display: flex;
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		background-color: var(--color-primary-500);
		width: 24px;
		height: 24px;
		color: white;
	}

	/* Téma mód korongok - Hasonló a szín választóhoz */
	.theme-mode-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.theme-swatch {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		cursor: pointer;
		border: 3px solid transparent;
		border-radius: 50%;
		padding: 0;
		width: 40px;
		height: 40px;
	}

	.theme-swatch:hover {
		border-color: rgba(0, 0, 0, 0.3);
	}

	:global(.dark) .theme-swatch:hover {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.theme-swatch:focus {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.theme-swatch:focus:not(:focus-visible) {
		outline: none;
	}

	.theme-swatch.active {
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
		border-color: rgba(0, 0, 0, 0.5);
	}

	:global(.dark) .theme-swatch.active {
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.6);
	}

	/* Világos mód korong */
	.light-swatch {
		border: 3px solid var(--color-neutral-300);
		background: linear-gradient(135deg, #e5e5e5 0%, #d0d0d0 100%);
	}

	:global(.dark) .light-swatch {
		border-color: var(--color-neutral-600);
	}

	.light-swatch:hover {
		border-color: var(--color-neutral-400);
	}

	:global(.dark) .light-swatch:hover {
		border-color: var(--color-neutral-500);
	}

	.light-swatch.active {
		border-color: var(--color-neutral-600);
	}

	:global(.dark) .light-swatch.active {
		border-color: var(--color-neutral-400);
	}

	/* Sötét mód korong */
	.dark-swatch {
		border: 3px solid var(--color-neutral-700);
		background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
	}

	:global(.dark) .dark-swatch {
		border-color: var(--color-neutral-500);
	}

	.dark-swatch:hover {
		border-color: var(--color-neutral-600);
	}

	:global(.dark) .dark-swatch:hover {
		border-color: var(--color-neutral-400);
	}

	.dark-swatch.active {
		border-color: var(--color-neutral-900);
	}

	:global(.dark) .dark-swatch.active {
		border-color: var(--color-neutral-300);
	}

	/* Automatikus mód korong - fele világos, fele sötét */
	.auto-swatch {
		border: 3px solid var(--color-neutral-400);
		background: linear-gradient(90deg, #e5e5e5 0%, #e5e5e5 50%, #1a1a1a 50%, #1a1a1a 100%);
	}

	:global(.dark) .auto-swatch {
		border-color: var(--color-neutral-500);
	}

	.auto-swatch:hover {
		border-color: var(--color-neutral-500);
	}

	:global(.dark) .auto-swatch:hover {
		border-color: var(--color-neutral-400);
	}

	.auto-swatch.active {
		border-color: var(--color-neutral-700);
	}

	:global(.dark) .auto-swatch.active {
		border-color: var(--color-neutral-300);
	}

	/* Checkmark a korongokon */
	.theme-swatch .checkmark {
		transition: opacity 0.2s ease;
		color: var(--color-neutral-600);
		font-weight: bold;
		font-size: 20px;
		text-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
	}

	.dark-swatch .checkmark {
		color: var(--color-neutral-300);
		text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
	}

	.auto-swatch .checkmark {
		color: var(--color-neutral-700);
		text-shadow:
			-1px -1px 0 #fff,
			1px -1px 0 #fff,
			-1px 1px 0 #fff,
			1px 1px 0 #fff;
	}

	:global(.dark) .auto-swatch .checkmark {
		color: var(--color-neutral-300);
	}

	/* Betűméret gombok */
	.font-size-buttons {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.font-size-buttons :global(button) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
