<script lang="ts">
	import { untrack } from 'svelte';
	import { DataTable, DataTableFacetedFilter } from '$lib/components/ui/data-table';
	import type { PaginationInfo, DataTableState } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { ConfirmDialog } from '$lib/components/ui';
	import X from 'lucide-svelte/icons/x';
	import { useI18n } from '$lib/i18n/hooks';
	import { getAppShell } from '$lib/apps/appShell.svelte';
	import { fetchErrorLogs, deleteErrorLog } from '../error-logs.remote';
	import type { LogEntry } from '$lib/server/logging/types';
	import { createColumns } from './errorLogColumns';
	import { toast } from 'svelte-sonner';

	const { t } = useI18n();
	const shell = getAppShell();

	function handleOpenEntry(entry: LogEntry) {
		shell.navigateTo('ErrorLogDetail', { logId: entry.id }, '#error');
	}

	// Törlés megerősítő dialog
	let deleteDialogOpen = $state(false);
	let entryToDelete = $state<LogEntry | null>(null);

	function handleDeleteEntry(entry: LogEntry) {
		entryToDelete = entry;
		deleteDialogOpen = true;
	}

	function cancelDelete() {
		deleteDialogOpen = false;
		entryToDelete = null;
	}

	async function confirmDelete() {
		if (!entryToDelete) return;
		try {
			const result = await deleteErrorLog({ id: entryToDelete.id });
			if (result.success) {
				toast.success(t('log.error.detail.deleteSuccess'));
				deleteDialogOpen = false;
				entryToDelete = null;
				await loadData();
			} else {
				toast.error(result.error || t('log.error.detail.deleteError'));
			}
		} catch (err) {
			console.error('Failed to delete error log:', err);
			toast.error(t('log.error.detail.deleteError'));
		}
	}

	let data = $state<LogEntry[]>([]);
	let loading = $state(false);
	let paginationInfo = $state<PaginationInfo>({
		page: 1,
		pageSize: 20,
		totalCount: 0,
		totalPages: 0
	});

	let levelFilter = $state<string[]>([]);
	let sourceFilter = $state('');
	let tableState = $state<DataTableState>({
		page: 1,
		pageSize: 20,
		sortBy: 'timestamp',
		sortOrder: 'desc'
	});

	let dataTable: DataTable<LogEntry>;

	function handleStateChange(state: DataTableState) {
		tableState = state;
	}

	function handleLevelChange(values: string[]) {
		levelFilter = values;
	}

	function handleSourceChange(value: string) {
		sourceFilter = value;
	}

	const columns = $derived(
		createColumns({
			t,
			onSort: (id, desc) => dataTable.handleSort(id, desc),
			onOpen: handleOpenEntry,
			onDelete: handleDeleteEntry
		})
	);

	const levels = [
		{ value: 'debug', label: 'DEBUG' },
		{ value: 'info', label: 'INFO' },
		{ value: 'warn', label: 'WARN' },
		{ value: 'error', label: 'ERROR' },
		{ value: 'fatal', label: 'FATAL' }
	];

	let isFiltered = $derived(!!sourceFilter || levelFilter.length > 0);

	let debounceTimer: ReturnType<typeof setTimeout>;
	function handleSourceInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			handleSourceChange(value);
		}, 300);
	}

	function handleReset() {
		handleSourceChange('');
		handleLevelChange([]);
	}

	async function loadData() {
		loading = true;
		try {
			const result = await fetchErrorLogs({
				page: tableState.page,
				pageSize: tableState.pageSize,
				level: levelFilter.length > 0 ? (levelFilter as any) : undefined,
				source: sourceFilter || undefined,
				sortBy: tableState.sortBy,
				sortOrder: tableState.sortOrder
			});
			if (result.success) {
				data = result.data;
				paginationInfo = result.pagination;
			}
		} catch (err) {
			console.error('Failed to load error logs:', err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		tableState;
		levelFilter;
		sourceFilter;
		untrack(() => loadData());
	});
</script>

<DataTable
	bind:this={dataTable}
	{columns}
	{data}
	pagination={paginationInfo}
	{loading}
	striped
	initialSortBy="timestamp"
	initialSortOrder="desc"
	onStateChange={handleStateChange}
>
	{#snippet toolbar({ table, handleSort })}
		<Input
			placeholder={t('log.error.filters.sourcePlaceholder')}
			value={sourceFilter}
			oninput={handleSourceInput}
			class="h-8 w-[150px] lg:w-[250px]"
		/>
		<DataTableFacetedFilter
			title={t('log.error.columns.level')}
			options={levels}
			selectedValues={levelFilter}
			onValuesChange={handleLevelChange}
		/>
		{#if isFiltered}
			<Button variant="ghost" onclick={handleReset} class="h-8 px-2 lg:px-3">
				{t('log.error.filters.reset')}
				<X class="ml-2 size-4" />
			</Button>
		{/if}
	{/snippet}
</DataTable>

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
