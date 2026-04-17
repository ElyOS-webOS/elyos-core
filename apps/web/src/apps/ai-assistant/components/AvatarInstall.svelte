<!--
  AvatarInstall — Avatar telepítési panel.

  Fájl feltöltési felületet biztosít .raconapkg fájlok telepítéséhez.
  A feltöltés után meghívja az installAvatar parancsot, és megjeleníti
  a sikeres telepítés vagy a validációs hiba üzenetét.

  Requirements: 5.1, 5.2, 5.3, 5.4, 5.7
-->
<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { useI18n } from '$lib/i18n/hooks';
	import { installAvatar } from '../avatar.remote.js';

	const { t } = useI18n();

	// -------------------------------------------------------------------------
	// Állapot
	// -------------------------------------------------------------------------

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFile = $state<File | null>(null);
	let installing = $state(false);
	let errorMessage = $state<string | null>(null);
	let successMessage = $state<string | null>(null);

	// -------------------------------------------------------------------------
	// Fájl kiválasztás
	// -------------------------------------------------------------------------

	function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;

		errorMessage = null;
		successMessage = null;

		if (file && !file.name.endsWith('.raconapkg')) {
			errorMessage = t('ai-assistant.install.invalidFileType');
			selectedFile = null;
			input.value = '';
			return;
		}

		selectedFile = file;
	}

	// -------------------------------------------------------------------------
	// Telepítés
	// -------------------------------------------------------------------------

	async function handleInstall() {
		if (!selectedFile) return;

		installing = true;
		errorMessage = null;
		successMessage = null;

		try {
			// Fájl beolvasása base64-be
			const fileData = await readFileAsBase64(selectedFile);

			const result = await installAvatar({
				fileName: selectedFile.name,
				fileData
			});

			if (result.success) {
				successMessage = t('ai-assistant.install.success', {
					name: result.avatar?.displayName ?? selectedFile.name
				});
				toast.success(successMessage);
				// Visszaállítás
				selectedFile = null;
				if (fileInput) fileInput.value = '';
			} else {
				errorMessage = result.error ?? t('ai-assistant.install.unknownError');
				toast.error(errorMessage);
			}
		} catch (err) {
			console.error('[AvatarInstall] Hiba:', err);
			errorMessage = t('ai-assistant.install.unknownError');
			toast.error(errorMessage);
		} finally {
			installing = false;
		}
	}

	// -------------------------------------------------------------------------
	// Segédfüggvény: File → base64
	// -------------------------------------------------------------------------

	function readFileAsBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				const result = reader.result as string;
				// "data:...;base64,<data>" → csak az adat rész
				const base64 = result.split(',')[1];
				resolve(base64);
			};
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}
</script>

<div class="avatar-install">
	<section class="avatar-install__section">
		<h3 class="avatar-install__section-title">{t('ai-assistant.install.title')}</h3>
		<p class="avatar-install__description">{t('ai-assistant.install.description')}</p>
	</section>

	<!-- Fájl feltöltő (Req 5.1) -->
	<section class="avatar-install__section">
		<label for="avatar-pkg-input" class="avatar-install__label">
			{t('ai-assistant.install.fileLabel')}
		</label>
		<input
			id="avatar-pkg-input"
			bind:this={fileInput}
			type="file"
			accept=".raconapkg"
			onchange={handleFileChange}
			disabled={installing}
			class="avatar-install__file-input"
			aria-describedby={errorMessage ? 'avatar-install-error' : undefined}
		/>
		{#if selectedFile}
			<p class="avatar-install__selected-file">
				📦 {selectedFile.name}
			</p>
		{/if}
	</section>

	<!-- Hibaüzenet (Req 5.2, 5.3, 5.4) -->
	{#if errorMessage}
		<div id="avatar-install-error" class="avatar-install__error" role="alert">
			{errorMessage}
		</div>
	{/if}

	<!-- Sikeres telepítés (Req 5.7) -->
	{#if successMessage}
		<div class="avatar-install__success" role="status">
			{successMessage}
		</div>
	{/if}

	<!-- Telepítés gomb -->
	<div class="avatar-install__actions">
		<Button onclick={handleInstall} disabled={!selectedFile || installing}>
			{installing ? t('ai-assistant.install.installing') : t('ai-assistant.install.install')}
		</Button>
	</div>
</div>

<style>
	.avatar-install {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding: 1rem;
		height: 100%;
		overflow-y: auto;
	}

	.avatar-install__section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.avatar-install__section-title {
		margin: 0;
		color: var(--color-neutral-600);
		font-weight: 600;
		font-size: 0.8125rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	:global(.dark) .avatar-install__section-title {
		color: var(--color-neutral-400);
	}

	.avatar-install__description {
		margin: 0;
		color: var(--color-neutral-500);
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.avatar-install__label {
		color: var(--color-neutral-700);
		font-weight: 500;
		font-size: 0.875rem;
	}

	:global(.dark) .avatar-install__label {
		color: var(--color-neutral-300);
	}

	.avatar-install__file-input {
		cursor: pointer;
		border: 1px dashed var(--color-neutral-300);
		border-radius: var(--radius-md, 0.5rem);
		background: var(--color-neutral-50);
		padding: 0.75rem;
		width: 100%;
		color: var(--color-neutral-700);
		font-size: 0.875rem;
	}

	:global(.dark) .avatar-install__file-input {
		border-color: var(--color-neutral-600);
		background: var(--color-neutral-800);
		color: var(--color-neutral-300);
	}

	.avatar-install__file-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.avatar-install__selected-file {
		margin: 0;
		color: var(--color-neutral-600);
		font-size: 0.8125rem;
	}

	:global(.dark) .avatar-install__selected-file {
		color: var(--color-neutral-400);
	}

	.avatar-install__error {
		border-radius: var(--radius-md, 0.5rem);
		background: var(--color-red-50, #fef2f2);
		padding: 0.75rem 1rem;
		color: var(--color-red-700, #b91c1c);
		font-size: 0.875rem;
	}

	:global(.dark) .avatar-install__error {
		background: var(--color-red-950, #450a0a);
		color: var(--color-red-400, #f87171);
	}

	.avatar-install__success {
		border-radius: var(--radius-md, 0.5rem);
		background: var(--color-green-50, #f0fdf4);
		padding: 0.75rem 1rem;
		color: var(--color-green-700, #15803d);
		font-size: 0.875rem;
	}

	:global(.dark) .avatar-install__success {
		background: var(--color-green-950, #052e16);
		color: var(--color-green-400, #4ade80);
	}

	.avatar-install__actions {
		display: flex;
		justify-content: flex-end;
		padding-top: 0.25rem;
	}
</style>
