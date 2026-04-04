<script lang="ts">
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { IconButton } from '$lib/components/shared/buttons';
	import { ConfirmDialog } from '$lib/components/ui';
	import { ArrowLeft, Trash2 } from 'lucide-svelte/icons';
	import { getAppShell } from '$lib/apps/appShell.svelte';
	import { getActionBar } from '$lib/apps/actionBar.svelte';
	import { useI18n } from '$lib/i18n/hooks';
	import { fetchErrorLog, deleteErrorLog } from '../error-logs.remote';
	import type { LogEntry } from '$lib/server/logging/types';
	import { toast } from 'svelte-sonner';

	interface Props {
		logId: string;
		returnTo?: string;
	}

	let { logId, returnTo = 'ErrorLog' }: Props = $props();

	const shell = getAppShell();
	const actionBar = getActionBar();
	const { t } = useI18n();

	let entry = $state<LogEntry | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Törlés megerősítő dialog
	let deleteDialogOpen = $state(false);

	function handleBack() {
		actionBar.clear();
		shell.navigateTo(returnTo);
	}

	function handleDeleteClick() {
		deleteDialogOpen = true;
	}

	function cancelDelete() {
		deleteDialogOpen = false;
	}

	async function confirmDelete() {
		if (!entry) return;
		try {
			const result = await deleteErrorLog({ id: entry.id });
			if (result.success) {
				toast.success(t('log.error.detail.deleteSuccess'));
				deleteDialogOpen = false;
				handleBack();
			} else {
				toast.error(result.error || t('log.error.detail.deleteError'));
			}
		} catch (err) {
			console.error('Failed to delete error log:', err);
			toast.error(t('log.error.detail.deleteError'));
		}
	}

	async function loadEntry() {
		loading = true;
		error = null;
		try {
			const result = await fetchErrorLog({ id: logId });
			if (result.success && result.data) {
				entry = result.data;
				actionBar.set(viewActions);
			} else {
				error = result.error || t('log.error.detail.error');
			}
		} catch (err) {
			console.error('Failed to load error log entry:', err);
			error = t('log.error.detail.error');
		} finally {
			loading = false;
		}
	}

	const levelColorMap: Record<string, string> = {
		debug: 'bg-gray-500',
		info: 'bg-blue-500',
		warn: 'bg-yellow-500',
		error: 'bg-red-500',
		fatal: 'bg-red-700'
	};

	$effect(() => {
		const id = logId;
		if (id) {
			untrack(() => loadEntry());
		}
	});
</script>

{#snippet viewActions()}
	<IconButton
		variant="destructive"
		text={t('log.error.actions.delete')}
		onclick={handleDeleteClick}
	>
		{#snippet icon()}<Trash2 />{/snippet}
	</IconButton>
{/snippet}

<div class="title-block">
	<div class="flex items-center gap-2">
		<Button variant="ghost" size="icon" class="size-8" onclick={handleBack}>
			<ArrowLeft class="size-4" />
			<span class="sr-only">{t('common.buttons.back')}</span>
		</Button>
		<h2>{t('log.error.detail.title')}</h2>
	</div>
</div>

{#if loading}
	<div class="flex items-center justify-center py-8">
		<p class="text-muted-foreground">{t('common.status.loading')}</p>
	</div>
{:else if error}
	<div class="error-block">
		<p>{error}</p>
	</div>
{:else if entry}
	<div class="detail-grid">
		<!-- Szint + Forrás + Időpont egy sorban -->
		<div class="meta-row">
			<div class="meta-left">
				<Badge class={levelColorMap[entry.level] ?? ''}>{entry.level.toUpperCase()}</Badge>
				<Badge variant="outline" class="font-mono">{entry.source}</Badge>
			</div>
			<span class="meta-timestamp">
				{new Date(entry.timestamp).toLocaleString()}
			</span>
		</div>

		<div class="detail-field">
			<span class="detail-label">{t('log.error.columns.message')}</span>
			<span class="detail-value">{entry.message}</span>
		</div>

		{#if entry.url}
			<div class="detail-field">
				<span class="detail-label">{t('log.error.columns.url')}</span>
				<span class="detail-value font-mono">{entry.url}</span>
			</div>
		{/if}

		{#if entry.method}
			<div class="detail-field">
				<span class="detail-label">{t('log.error.detail.method')}</span>
				<span class="detail-value">
					<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">{entry.method}</span>
				</span>
			</div>
		{/if}

		{#if entry.routeId}
			<div class="detail-field">
				<span class="detail-label">{t('log.error.detail.routeId')}</span>
				<span class="detail-value font-mono">{entry.routeId}</span>
			</div>
		{/if}

		{#if entry.userId}
			<div class="detail-field">
				<span class="detail-label">{t('log.error.detail.userId')}</span>
				<span class="detail-value font-mono">{entry.userId}</span>
			</div>
		{/if}

		{#if entry.userAgent}
			<div class="detail-field">
				<span class="detail-label">{t('log.error.detail.userAgent')}</span>
				<span class="detail-value break-all">{entry.userAgent}</span>
			</div>
		{/if}

		{#if entry.stack}
			<div class="detail-field">
				<span class="detail-label">{t('log.error.detail.stack')}</span>
				<pre
					class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs leading-relaxed">{entry.stack}</pre>
			</div>
		{/if}

		{#if entry.context && Object.keys(entry.context).length > 0}
			<div class="detail-field">
				<span class="detail-label">{t('log.error.detail.context')}</span>
				<pre
					class="bg-muted overflow-x-auto rounded-md p-3 font-mono text-xs leading-relaxed">{JSON.stringify(
						entry.context,
						null,
						2
					)}</pre>
			</div>
		{/if}
	</div>
{/if}

<!-- Törlés megerősítő dialog -->
<ConfirmDialog
	bind:open={deleteDialogOpen}
	title={t('log.error.detail.deleteTitle')}
	description={t('log.error.detail.deleteDescription')}
	confirmText={t('log.error.detail.deleteConfirm')}
	cancelText={t('common.buttons.cancel')}
	confirmVariant="destructive"
	onConfirm={confirmDelete}
	onCancel={cancelDelete}
/>

<style>
	.detail-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.25rem;
		max-width: 48rem;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.meta-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.meta-timestamp {
		color: var(--color-neutral-500);
		font-size: 0.8125rem;
		white-space: nowrap;
	}

	.detail-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.detail-label {
		color: var(--color-neutral-500);
		font-weight: 500;
		font-size: 0.8125rem;
	}

	.detail-value {
		font-size: 0.9375rem;
	}

	.error-block {
		margin: 1rem 0;
		border: 1px solid var(--color-red-200);
		border-radius: var(--radius-md, 0.375rem);
		background-color: var(--color-red-50);
		padding: 1rem;
		color: var(--color-red-700);
	}

	:global(.dark) .error-block {
		border-color: var(--color-red-700);
		background-color: var(--color-red-900);
		color: var(--color-red-200);
	}
</style>
