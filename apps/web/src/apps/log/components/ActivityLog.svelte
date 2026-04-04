<script lang="ts">
	import { untrack } from 'svelte';
	import { DataTable } from '$lib/components/ui/data-table';
	import type { PaginationInfo, DataTableState } from '$lib/components/ui/data-table';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import X from 'lucide-svelte/icons/x';
	import { useI18n } from '$lib/i18n/hooks';
	import { fetchActivityLogs } from '../activity-logs.remote';
	import type { ActivityEntry } from '$lib/server/activity-log/types';
	import { createColumns } from './activityLogColumns';
	import { toast } from 'svelte-sonner';

	const { t } = useI18n();

	let data = $state<ActivityEntry[]>([]);
	let loading = $state(false);
	let paginationInfo = $state<PaginationInfo>({
		page: 1,
		pageSize: 20,
		totalCount: 0,
		totalPages: 0
	});

	let userIdFilter = $state('');
	let actionKeyFilter = $state('');
	let tableState = $state<DataTableState>({
		page: 1,
		pageSize: 20,
		sortBy: 'createdAt',
		sortOrder: 'desc'
	});

	let dataTable: DataTable<ActivityEntry>;

	function handleStateChange(state: DataTableState) {
		tableState = state;
	}

	const columns = $derived(
		createColumns({
			t,
			onSort: (id, desc) => dataTable.handleSort(id, desc)
		})
	);

	let isFiltered = $derived(!!userIdFilter || !!actionKeyFilter);

	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleUserIdInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			userIdFilter = value;
		}, 300);
	}

	function handleActionKeyInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			actionKeyFilter = value;
		}, 300);
	}

	function handleReset() {
		userIdFilter = '';
		actionKeyFilter = '';
	}

	async function loadData() {
		loading = true;
		try {
			const result = await fetchActivityLogs({
				page: tableState.page,
				pageSize: tableState.pageSize,
				userId: userIdFilter || undefined,
				actionKey: actionKeyFilter || undefined,
				sortBy: tableState.sortBy,
				sortOrder: tableState.sortOrder
			});
			if (result.success) {
				data = result.data;
				paginationInfo = result.pagination;
			} else {
				toast.error(result.error || t('log.activity.loadError'));
			}
		} catch (err) {
			console.error('Failed to load activity logs:', err);
			toast.error(t('log.activity.loadError'));
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		tableState;
		userIdFilter;
		actionKeyFilter;
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
	initialSortBy="createdAt"
	initialSortOrder="desc"
	onStateChange={handleStateChange}
>
	{#snippet toolbar()}
		<Input
			placeholder={t('log.activity.filters.userIdPlaceholder')}
			value={userIdFilter}
			oninput={handleUserIdInput}
			class="h-8 w-[150px] lg:w-[200px]"
		/>
		<Input
			placeholder={t('log.activity.filters.actionKeyPlaceholder')}
			value={actionKeyFilter}
			oninput={handleActionKeyInput}
			class="h-8 w-[150px] lg:w-[200px]"
		/>
		{#if isFiltered}
			<Button variant="ghost" onclick={handleReset} class="h-8 px-2 lg:px-3">
				{t('log.error.filters.reset')}
				<X class="ml-2 size-4" />
			</Button>
		{/if}
	{/snippet}
</DataTable>
