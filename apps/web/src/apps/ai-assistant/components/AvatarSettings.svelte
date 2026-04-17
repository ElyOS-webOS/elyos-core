<!--
  AvatarSettings — Avatar beállítások panel.

  Vízszintes osztású elrendezés:
  - Felső blokk: kiválasztott avatar megjelenítése (bal oldal) + beállítások (jobb oldal)
  - Alsó blokk: telepített avatárok listája (grid elrendezés cover képekkel)

  Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7, 9.7
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { mode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { useI18n } from '$lib/i18n/hooks';
	import { listAvatars, getAvatarConfig, saveAvatarConfig } from '../avatar.remote.js';
	import type { AiAvatarSelectModel } from '@racona/database/schemas';
	import RaccoonHead from './AvatarHead.svelte';
	import { getAiAssistantStore } from '../stores/aiAssistantStore.svelte.js';

	const { t } = useI18n();
	const aiStore = getAiAssistantStore();

	// -------------------------------------------------------------------------
	// Állapot
	// -------------------------------------------------------------------------

	let avatars = $state<AiAvatarSelectModel[]>([]);
	let loading = $state(true);
	let saving = $state(false);

	// Eredeti konfiguráció (a visszavonáshoz)
	let originalConfig = $state<{
		avatarIdname: string | null;
		quality: 'sd' | 'hd';
		customName: string;
	}>({
		avatarIdname: null,
		quality: 'sd',
		customName: ''
	});

	// Aktuális szerkesztett állapot
	let selectedIdname = $state<string | null>(null);
	let customName = $state('');
	let quality = $state<'sd' | 'hd'>('sd');

	// Téma
	const theme = $derived<'light' | 'dark'>(mode.current === 'dark' ? 'dark' : 'light');

	// Panel referencia az egérkövetéshez
	let panelRef = $state<HTMLDivElement | undefined>();

	// -------------------------------------------------------------------------
	// Betöltés
	// -------------------------------------------------------------------------

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			const [avatarsResult, configResult] = await Promise.all([listAvatars(), getAvatarConfig()]);

			console.log('[AvatarSettings] loadData - config result:', configResult);

			if (avatarsResult.success) {
				avatars = avatarsResult.avatars;
			}

			// Először nézzük meg, van-e már betöltött avatar a store-ban
			const storeUrl = aiStore.avatarModelUrl;
			let configFromStore: {
				avatarIdname: string;
				quality: 'sd' | 'hd';
				customName: string;
			} | null = null;

			if (storeUrl) {
				// Parse-oljuk ki az idname-t és quality-t az URL-ből
				const match = storeUrl.match(/\/api\/ai-avatar\/([^/]+)\/\1_(sd|hd)\.glb/);
				if (match) {
					const [, idname, qual] = match;
					configFromStore = {
						avatarIdname: idname,
						quality: qual as 'sd' | 'hd',
						customName: '' // A customName-t nem tudjuk az URL-ből kiolvasni
					};
					console.log('[AvatarSettings] loadData - config a store-ból:', configFromStore);
				}
			}

			// Ha van config a store-ban, azt használjuk (ez a legfrissebb)
			// Különben az adatbázisból jövő config-ot
			const effectiveConfig = configFromStore || configResult.config;

			if (effectiveConfig) {
				// Van mentett konfiguráció
				console.log('[AvatarSettings] loadData - beállított konfiguráció:', {
					avatarIdname: effectiveConfig.avatarIdname,
					quality: effectiveConfig.quality,
					customName: effectiveConfig.customName
				});

				originalConfig = {
					avatarIdname: effectiveConfig.avatarIdname,
					quality: effectiveConfig.quality as 'sd' | 'hd',
					customName: effectiveConfig.customName ?? ''
				};
				selectedIdname = originalConfig.avatarIdname;
				quality = originalConfig.quality;
				customName = originalConfig.customName;

				console.log('[AvatarSettings] loadData - state frissítve:', {
					selectedIdname,
					quality,
					customName
				});
			} else {
				// Nincs mentett konfiguráció
				originalConfig = {
					avatarIdname: null,
					quality: 'sd',
					customName: ''
				};
			}
		} catch (err) {
			console.error('[AvatarSettings] Betöltési hiba:', err);
		} finally {
			loading = false;
		}
	}

	// -------------------------------------------------------------------------
	// Kiválasztott avatar adatai
	// -------------------------------------------------------------------------

	const selectedAvatar = $derived(avatars.find((a) => a.idname === selectedIdname) ?? null);

	// Placeholder: manifest display name (Req 4.7)
	const namePlaceholder = $derived(selectedAvatar?.displayName ?? '');

	// Elérhető minőségi szintek a kiválasztott avatarhoz
	const availableQualities = $derived(selectedAvatar?.availableQualities ?? []);

	// Ellenőrizzük, hogy a kiválasztott minőség elérhető-e
	const isQualityAvailable = $derived.by(() => {
		if (!selectedAvatar) return { sd: false, hd: false };
		return {
			sd: availableQualities.includes('sd'),
			hd: availableQualities.includes('hd')
		};
	});

	// Modell URL a preview-hoz
	const previewModelUrl = $derived.by(() => {
		if (!selectedIdname) return undefined;
		return `/api/ai-avatar/${selectedIdname}/${selectedIdname}_${quality}.glb`;
	});

	// Van-e változás az eredeti konfigurációhoz képest
	const hasChanges = $derived(
		selectedIdname !== originalConfig.avatarIdname ||
			quality !== originalConfig.quality ||
			customName !== originalConfig.customName
	);

	// -------------------------------------------------------------------------
	// Avatar kiválasztása a listából
	// -------------------------------------------------------------------------

	function selectAvatar(idname: string) {
		selectedIdname = idname;
		const avatar = avatars.find((a) => a.idname === idname);

		// Ha nincs még mentett konfiguráció, akkor az első elérhető minőséggel jelenítjük meg
		if (originalConfig.avatarIdname === null && avatar) {
			// Preferáljuk az SD-t, ha elérhető, különben HD
			quality = avatar.availableQualities.includes('sd') ? 'sd' : 'hd';
		} else if (avatar) {
			// Ha van mentett konfiguráció, de a kiválasztott minőség nem elérhető, válasszuk az első elérhetőt
			if (!avatar.availableQualities.includes(quality)) {
				quality = avatar.availableQualities[0];
			}
		}
	}

	// -------------------------------------------------------------------------
	// Mentés
	// -------------------------------------------------------------------------

	async function handleSave() {
		if (!selectedIdname) {
			toast.error(t('ai-assistant.settings.noAvatarSelected'));
			return;
		}

		console.log('[AvatarSettings] Mentés indítása:', {
			avatarIdname: selectedIdname,
			quality,
			customName: customName.trim() || null
		});

		saving = true;
		try {
			const result = await saveAvatarConfig({
				avatarIdname: selectedIdname,
				quality,
				customName: customName.trim() || null
			});

			console.log('[AvatarSettings] Mentés eredménye:', result);

			if (result.success) {
				toast.success(t('ai-assistant.settings.saveSuccess'));

				// Frissítjük az eredeti konfigurációt a lokális state-ben
				originalConfig = {
					avatarIdname: selectedIdname,
					quality,
					customName: customName.trim()
				};

				// Frissítjük a store-t is, hogy a taskbar fixed panel is frissüljön
				const modelUrl = `/api/ai-avatar/${selectedIdname}/${selectedIdname}_${quality}.glb`;
				console.log('[AvatarSettings] Avatar mentve, store frissítése:', modelUrl);
				aiStore.setAvatarModelUrl(modelUrl);
			} else {
				console.error('[AvatarSettings] Mentés sikertelen:', result.error);
				toast.error(result.error ?? t('ai-assistant.settings.saveError'));
			}
		} catch (err) {
			console.error('[AvatarSettings] Mentési hiba:', err);
			toast.error(t('ai-assistant.settings.saveError'));
		} finally {
			saving = false;
		}
	}

	// -------------------------------------------------------------------------
	// Visszavonás
	// -------------------------------------------------------------------------

	function handleCancel() {
		selectedIdname = originalConfig.avatarIdname;
		quality = originalConfig.quality;
		customName = originalConfig.customName;
	}
</script>

<div class="avatar-settings">
	{#if loading}
		<div
			class="avatar-settings__loading"
			role="status"
			aria-label={t('ai-assistant.settings.loading')}
		>
			<span class="avatar-settings__spinner" aria-hidden="true"></span>
			<span>{t('ai-assistant.settings.loading')}</span>
		</div>
	{:else}
		<!-- Felső blokk: Avatar preview + beállítások -->
		<div class="avatar-settings__top">
			<!-- Bal oldal: 3D avatar preview -->
			<div class="avatar-settings__preview" bind:this={panelRef}>
				{#if selectedIdname}
					{#key `${selectedIdname}-${quality}`}
						<RaccoonHead
							emotionState="neutral"
							{theme}
							enableMouseTracking={true}
							{panelRef}
							headAnimationMode="idle"
							modelUrl={previewModelUrl}
						/>
					{/key}
				{:else}
					<div class="avatar-settings__no-selection">
						<p>{t('ai-assistant.settings.noAvatarSelected')}</p>
						<p class="avatar-settings__no-selection-hint">
							{t('ai-assistant.settings.selectFromBelow')}
						</p>
					</div>
				{/if}
			</div>

			<!-- Jobb oldal: Beállítások -->
			<div class="avatar-settings__config">
				{#if selectedIdname}
					<!-- Egyéni név (Req 4.3) -->
					<div class="avatar-settings__field">
						<Label for="avatar-custom-name">{t('ai-assistant.settings.customName')}</Label>
						<Input
							id="avatar-custom-name"
							type="text"
							bind:value={customName}
							placeholder={namePlaceholder}
						/>
					</div>

					<!-- Minőség (Req 4.4) -->
					<div class="avatar-settings__field">
						<fieldset class="avatar-settings__quality-fieldset">
							<legend class="avatar-settings__quality-legend">
								{t('ai-assistant.settings.quality')}
							</legend>
							<div class="avatar-settings__quality-options">
								{#if isQualityAvailable.sd}
									<label class="avatar-settings__quality-label">
										<input
											type="radio"
											name="avatar-quality"
											value="sd"
											bind:group={quality}
											class="avatar-settings__radio"
										/>
										<span>SD</span>
									</label>
								{/if}
								{#if isQualityAvailable.hd}
									<label class="avatar-settings__quality-label">
										<input
											type="radio"
											name="avatar-quality"
											value="hd"
											bind:group={quality}
											class="avatar-settings__radio"
										/>
										<span>HD</span>
									</label>
								{/if}
							</div>
						</fieldset>
					</div>

					<!-- Mentés / Mégse gombok -->
					<div class="avatar-settings__actions">
						<Button variant="outline" onclick={handleCancel} disabled={saving || !hasChanges}>
							{t('ai-assistant.settings.cancel')}
						</Button>
						<Button onclick={handleSave} disabled={saving || !hasChanges}>
							{saving ? t('ai-assistant.settings.saving') : t('ai-assistant.settings.save')}
						</Button>
					</div>
				{:else}
					<div class="avatar-settings__no-selection-info">
						<p>{t('ai-assistant.settings.noAvatarSelected')}</p>
						<p class="avatar-settings__no-selection-hint">
							{t('ai-assistant.settings.selectFromBelow')}
						</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Alsó blokk: Telepített avatárok listája -->
		<div class="avatar-settings__bottom">
			<h3 class="avatar-settings__section-title">{t('ai-assistant.settings.installedAvatars')}</h3>
			{#if avatars.length === 0}
				<div class="avatar-settings__empty">
					<p>{t('ai-assistant.settings.noAvatarsInstalled')}</p>
					<p class="avatar-settings__empty-hint">{t('ai-assistant.settings.installHint')}</p>
				</div>
			{:else}
				<div
					class="avatar-settings__grid"
					role="radiogroup"
					aria-label={t('ai-assistant.settings.selectAvatar')}
				>
					{#each avatars as avatar (avatar.idname)}
						<button
							type="button"
							role="radio"
							aria-checked={selectedIdname === avatar.idname}
							class="avatar-settings__card"
							class:avatar-settings__card--selected={selectedIdname === avatar.idname}
							onclick={() => selectAvatar(avatar.idname)}
						>
							<img
								src="/api/ai-avatar/{avatar.idname}/{avatar.idname}_cover.jpg"
								alt={avatar.displayName}
								class="avatar-settings__cover"
								loading="lazy"
							/>
							<span class="avatar-settings__card-name">{avatar.displayName}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.avatar-settings {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.avatar-settings__loading {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		height: 100%;
		color: var(--color-neutral-500);
		font-size: 0.875rem;
	}

	.avatar-settings__spinner {
		display: inline-block;
		animation: spin 0.7s linear infinite;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		width: 1rem;
		height: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* ========================================================================
	   Felső blokk: Avatar preview + beállítások
	   ======================================================================== */

	.avatar-settings__top {
		display: flex;
		flex-shrink: 0;
		gap: 1.5rem;
		border-bottom: 1px solid var(--color-neutral-200);
		padding: 1.5rem;
		height: 420px;
	}

	:global(.dark) .avatar-settings__top {
		border-bottom-color: var(--color-neutral-700);
	}

	/* Bal oldal: 3D preview */
	.avatar-settings__preview {
		display: flex;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		border-radius: var(--radius-lg);
		background: var(--color-neutral-50);
		width: 380px;
		height: 100%;
	}

	:global(.dark) .avatar-settings__preview {
		background: var(--color-neutral-900);
	}

	.avatar-settings__no-selection {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		color: var(--color-neutral-500);
		font-size: 0.875rem;
		text-align: center;
	}

	.avatar-settings__no-selection-hint {
		color: var(--color-neutral-400);
		font-size: 0.8125rem;
	}

	/* Jobb oldal: Beállítások */
	.avatar-settings__config {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 1.25rem;
	}

	.avatar-settings__no-selection-info {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-neutral-500);
		font-size: 0.875rem;
		text-align: center;
	}

	.avatar-settings__field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Minőség */
	.avatar-settings__quality-fieldset {
		margin: 0;
		border: none;
		padding: 0;
	}

	.avatar-settings__quality-legend {
		margin-bottom: 0.5rem;
		color: var(--color-neutral-700);
		font-weight: 500;
		font-size: 0.875rem;
	}

	:global(.dark) .avatar-settings__quality-legend {
		color: var(--color-neutral-300);
	}

	.avatar-settings__quality-options {
		display: flex;
		gap: 1.25rem;
	}

	.avatar-settings__quality-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
		color: var(--color-neutral-700);
		font-size: 0.875rem;
	}

	:global(.dark) .avatar-settings__quality-label {
		color: var(--color-neutral-300);
	}

	.avatar-settings__radio {
		cursor: pointer;
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-primary-500, #3b82f6);
	}

	/* Mentés / Mégse gombok */
	.avatar-settings__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: auto;
	}

	/* ========================================================================
	   Alsó blokk: Telepített avatárok listája
	   ======================================================================== */

	.avatar-settings__bottom {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem;
		overflow-y: auto;
	}

	.avatar-settings__section-title {
		margin: 0;
		color: var(--color-neutral-700);
		font-weight: 600;
		font-size: 0.875rem;
		letter-spacing: 0.02em;
	}

	:global(.dark) .avatar-settings__section-title {
		color: var(--color-neutral-300);
	}

	.avatar-settings__empty {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		padding: 3rem 1rem;
		color: var(--color-neutral-500);
		font-size: 0.875rem;
		text-align: center;
	}

	.avatar-settings__empty-hint {
		color: var(--color-neutral-400);
		font-size: 0.8125rem;
	}

	/* Avatar rács */
	.avatar-settings__grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1.25rem;
	}

	.avatar-settings__card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		transition:
			border-color 0.15s,
			background 0.15s,
			transform 0.15s;
		cursor: pointer;
		border: 2px solid transparent;
		border-radius: var(--radius-md, 0.5rem);
		background: var(--color-neutral-100);
		padding: 0.75rem;
		text-align: center;
	}

	:global(.dark) .avatar-settings__card {
		background: var(--color-neutral-800);
	}

	.avatar-settings__card:hover {
		transform: translateY(-2px);
		border-color: var(--color-primary-300, #93c5fd);
		background: var(--color-neutral-50);
	}

	:global(.dark) .avatar-settings__card:hover {
		background: var(--color-neutral-700);
	}

	.avatar-settings__card--selected {
		border-color: var(--color-primary-500, #3b82f6);
		background: var(--color-primary-50, #eff6ff);
	}

	:global(.dark) .avatar-settings__card--selected {
		border-color: var(--color-primary-400, #60a5fa);
		background: var(--color-primary-950, #172554);
	}

	.avatar-settings__cover {
		border-radius: var(--radius-sm, 0.25rem);
		aspect-ratio: 1;
		width: 100%;
		object-fit: cover;
	}

	.avatar-settings__card-name {
		color: var(--color-neutral-700);
		font-weight: 500;
		font-size: 0.8125rem;
		line-height: 1.3;
		word-break: break-word;
	}

	:global(.dark) .avatar-settings__card-name {
		color: var(--color-neutral-300);
	}
</style>
