<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Upload, CheckCircle, X } from 'lucide-svelte';
	import { useI18n } from '$lib/i18n/hooks';
	import { getAppShell } from '$lib/apps/appShell.svelte';

	const { t } = useI18n();
	const shell = getAppShell();

	// Plugin config - hardcoded for now (can be fetched from API if needed)
	const PLUGIN_EXTENSION = '.elyospkg';
	const MAX_SIZE_MB = 10;

	// State
	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFile = $state<File | null>(null);
	let isDragging = $state(false);
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let uploadStatus = $state<'idle' | 'uploading' | 'success' | 'error'>('idle');
	let statusMessage = $state('');
	let errorDetails = $state<string[]>([]);

	// Translate error messages
	function translateError(error: string): string {
		// Check for specific error patterns
		if (error.includes('already exists')) {
			const match = error.match(/Plugin with ID '([^']+)' already exists/);
			if (match) {
				return t('plugin-manager.upload.errors.duplicatePlugin', { pluginId: match[1] });
			}
		}

		// Return original error if no translation found
		return error;
	}

	// Handlers
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			selectFile(file);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (file) {
			selectFile(file);
		}
	}

	function selectFile(file: File) {
		// Validate file extension
		if (!file.name.endsWith(PLUGIN_EXTENSION)) {
			uploadStatus = 'error';
			statusMessage = t('plugin-manager.upload.errors.invalidExtension', {
				extension: PLUGIN_EXTENSION
			});
			errorDetails = [];
			return;
		}

		// Validate file size
		const fileSizeMB = file.size / (1024 * 1024);
		if (fileSizeMB > MAX_SIZE_MB) {
			uploadStatus = 'error';
			statusMessage = t('plugin-manager.upload.errors.fileTooLarge', {
				maxSize: MAX_SIZE_MB,
				actualSize: fileSizeMB.toFixed(2)
			});
			errorDetails = [];
			return;
		}

		selectedFile = file;
		uploadStatus = 'idle';
		statusMessage = '';
		errorDetails = [];
	}

	async function uploadPluginFile() {
		if (!selectedFile) return;

		isUploading = true;
		uploadStatus = 'uploading';
		uploadProgress = 0;
		statusMessage = t('plugin-manager.upload.validating');
		errorDetails = [];

		try {
			const formData = new FormData();
			formData.append('file', selectedFile);

			const response = await fetch('/api/plugins/validate', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok && result.success) {
				uploadStatus = 'success';
				uploadProgress = 100;

				// Navigate to preview page
				if (shell && shell.navigateTo) {
					shell.navigateTo('PluginPreview', {
						tempFile: result.tempFile,
						manifest: result.manifest,
						warnings: result.warnings || []
					});
				} else {
					console.error('Shell is not available');
					statusMessage = 'Navigation error';
				}
			} else {
				uploadStatus = 'error';
				statusMessage = result.error || t('plugin-manager.upload.errors.uploadFailed');

				if (result.errors && Array.isArray(result.errors)) {
					errorDetails = result.errors.map((e: any) => e.message || e.code || String(e));
				}
			}
		} catch (error) {
			uploadStatus = 'error';
			statusMessage = t('plugin-manager.upload.errors.networkError');
			errorDetails = [error instanceof Error ? error.message : String(error)];
		} finally {
			isUploading = false;
		}
	}

	function resetUpload() {
		selectedFile = null;
		uploadStatus = 'idle';
		uploadProgress = 0;
		statusMessage = '';
		errorDetails = [];
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}
</script>

<div class="title-block">
	<h2>{t('plugin-manager.upload.title')}</h2>
	<h3>{t('plugin-manager.upload.description')}</h3>
</div>

<div class="mx-auto max-w-2xl">
	<Card.Root>
		<Card.Content class="space-y-4 pt-6">
			<!-- File Input (Hidden) -->
			<input
				bind:this={fileInput}
				type="file"
				accept={PLUGIN_EXTENSION}
				onchange={handleFileSelect}
				class="hidden"
			/>

			<!-- Drag & Drop Zone -->
			<div
				class="rounded-lg border-2 border-dashed p-8 text-center transition-colors {isDragging
					? 'border-primary bg-primary/5'
					: 'border-muted-foreground/25 hover:border-muted-foreground/50'} {isUploading
					? 'pointer-events-none opacity-50'
					: ''}"
				ondragover={handleDragOver}
				ondragleave={handleDragLeave}
				ondrop={handleDrop}
				role="button"
				tabindex="0"
				aria-label={t('plugin-manager.upload.dragDropLabel')}
			>
				<Upload class="text-muted-foreground mx-auto mb-4 h-12 w-12" />

				{#if selectedFile}
					<p class="mb-2 text-sm font-medium">{selectedFile.name}</p>
					<p class="text-muted-foreground mb-4 text-xs">
						{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
					</p>
				{:else}
					<p class="mb-2 text-sm font-medium">{t('plugin-manager.upload.dragDropText')}</p>
					<p class="text-muted-foreground mb-4 text-xs">
						{t('plugin-manager.upload.orBrowse')}
					</p>
				{/if}

				<Button onclick={triggerFileInput} disabled={isUploading} variant="outline">
					{t('plugin-manager.upload.browseFiles')}
				</Button>
			</div>

			<!-- Upload Progress -->
			{#if uploadStatus === 'uploading'}
				<div class="space-y-2">
					<div class="bg-secondary h-2 w-full overflow-hidden rounded-full">
						<div
							class="bg-primary h-full transition-all duration-300"
							style="width: {uploadProgress}%"
						></div>
					</div>
					<p class="text-muted-foreground text-center text-sm">
						{statusMessage}
					</p>
				</div>
			{/if}

			<!-- Status Messages -->
			{#if uploadStatus === 'success'}
				<div class="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
					<div class="flex items-start gap-3">
						<CheckCircle class="h-5 w-5 shrink-0 text-green-600" />
						<p class="text-sm text-green-800 dark:text-green-200">
							{statusMessage}
						</p>
					</div>
				</div>
			{/if}

			{#if uploadStatus === 'error'}
				<div class="bg-destructive/10 border-destructive rounded-lg border p-4">
					<div class="flex items-start gap-3">
						<X class="text-destructive h-5 w-5 shrink-0" />
						<div class="flex-1">
							<p class="text-destructive text-sm font-medium">{statusMessage}</p>
							{#if errorDetails.length > 0}
								<ul class="text-destructive/80 mt-2 list-inside list-disc text-sm">
									{#each errorDetails as detail}
										<li>{detail}</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Upload Button -->
			{#if selectedFile && uploadStatus !== 'uploading'}
				<div class="flex gap-2">
					<Button onclick={uploadPluginFile} disabled={isUploading} class="flex-1">
						<Upload class="mr-2 h-4 w-4" />
						{t('plugin-manager.upload.uploadButton')}
					</Button>
					<Button onclick={resetUpload} variant="outline" disabled={isUploading}>
						{t('common.buttons.cancel')}
					</Button>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
