<script lang="ts">
	import { untrack } from 'svelte';
	import { DataTable, DataTableFacetedFilter } from '$lib/components/ui/data-table';
	import type { PaginationInfo, DataTableState } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import X from 'lucide-svelte/icons/x';
	import { useI18n } from '$lib/i18n/hooks';
	import { getAppShell } from '$lib/apps/appShell.svelte';
	import { fetchPlugins } from '../plugins.remote';
	import type { PluginListItem } from '../plugins.remote';
	import { createColumns } from './pluginListColumns';

	const { t } = useI18n();
	const shell = getAppShell();

	function handleOpenPlugin(plugin: PluginListItem) {
		shell.navigateTo('PluginDetail', { pluginId: plugin.appId }, '#installed');
	}

	let data = $state<PluginListItem[]>([]);
	let loading = $state(false);
	let paginationInfo = $state<PaginationInfo>({
		page: 1,
		pageSize: 20,
		totalCount: 0,
		totalPages: 0
	});
	let tableState = $state<DataTableState>({
		page: 1,
		pageSize: 20,
		sortBy: 'name',
		sortOrder: 'asc'
	});

	let statusFilter = $state<string[]>([]);
	let searchFilter = $state('');

	let dataTable: DataTable<PluginListItem>;
	const columns = $derived(
		createColumns({
			t,
			onSort: (id, desc) => dataTable.handleSort(id, desc),
			onOpen: handleOpenPlugin
		})
	);

	const statusOptions = [
		{ value: 'active', label: t('plugin-manager.list.status.active') },
		{ value: 'inactive', label: t('plugin-manager.list.status.inactive') }
	];

	let isFiltered = $derived(statusFilter.length > 0 || !!searchFilter);

	function handleStatusChange(values: string[]) {
		statusFilter = values;
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			searchFilter = value;
		}, 300);
	}

	function handleReset() {
		statusFilter = [];
		searchFilter = '';
	}

	function handleStateChange(state: DataTableState) {
		tableState = state;
	}

	async function loadData() {
		loading = true;
		try {
			const status =
				statusFilter.length === 1 ? (statusFilter[0] as 'active' | 'inactive') : undefined;

			const result = await fetchPlugins({
				page: tableState.page,
				pageSize: tableState.pageSize,
				sortBy: tableState.sortBy,
				sortOrder: tableState.sortOrder,
				status,
				search: searchFilter || undefined
			});

			if (result.success) {
				data = result.data;
				paginationInfo = result.pagination;
			}
		} catch (err) {
			console.error('Failed to load plugins:', err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		tableState;
		statusFilter;
		searchFilter;
		untrack(() => loadData());
	});
</script>

<div class="title-block">
	<h2>{t('plugin-manager.list.title')}</h2>
	<h3>{t('plugin-manager.list.description')}</h3>
</div>

<DataTable
	bind:this={dataTable}
	{columns}
	{data}
	pagination={paginationInfo}
	{loading}
	striped
	initialSortBy="name"
	initialSortOrder="asc"
	onStateChange={handleStateChange}
>
	{#snippet toolbar({ table, handleSort })}
		<Input
			placeholder={t('plugin-manager.list.filters.searchPlaceholder')}
			value={searchFilter}
			oninput={handleSearchInput}
			class="h-8 w-[150px] lg:w-[250px]"
		/>
		<DataTableFacetedFilter
			title={t('plugin-manager.list.columns.status')}
			options={statusOptions}
			selectedValues={statusFilter}
			onValuesChange={handleStatusChange}
		/>
		{#if isFiltered}
			<Button variant="ghost" onclick={handleReset} class="h-8 px-2 lg:px-3">
				{t('plugin-manager.list.filters.reset')}
				<X class="ml-2 size-4" />
			</Button>
		{/if}
	{/snippet}
</DataTable>
