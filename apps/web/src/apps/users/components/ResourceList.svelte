<script lang="ts">
	import { untrack } from 'svelte';
	import { DataTable } from '$lib/components/ui/data-table';
	import type { PaginationInfo, DataTableState } from '$lib/components/ui/data-table';
	import { useI18n } from '$lib/i18n/hooks';
	import { getAppShell } from '$lib/apps/appShell.svelte';
	import { fetchResources } from '../resources.remote';
	import { createColumns } from './resourceListColumns';

	const { t } = useI18n();
	const shell = getAppShell();

	function handleOpenResource(resource: any) {
		shell.navigateTo('ResourceDetail', { resourceId: resource.id }, '#resources');
	}

	let data = $state<any[]>([]);
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

	let dataTable: DataTable<any>;
	const columns = $derived(
		createColumns({
			t,
			onSort: (id, desc) => dataTable.handleSort(id, desc),
			onOpen: handleOpenResource
		})
	);

	function handleStateChange(state: DataTableState) {
		tableState = state;
	}

	async function loadData() {
		loading = true;
		try {
			const result = await fetchResources({
				page: tableState.page,
				pageSize: tableState.pageSize,
				sortBy: tableState.sortBy,
				sortOrder: tableState.sortOrder
			});
			if (result.success) {
				data = result.data;
				paginationInfo = result.pagination;
			}
		} catch (err) {
			console.error('Failed to load resources:', err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		tableState;
		untrack(() => loadData());
	});
</script>

<div class="title-block">
	<h2>{t('users.resources.list.label')}</h2>
	<h3>{t('users.resources.list.description')}</h3>
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
/>
