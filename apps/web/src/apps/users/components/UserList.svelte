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
	import { fetchUsers, setUserActiveStatus } from '../users.remote';
	import type { UserListItem } from '$lib/server/database/repositories';
	import { createColumns } from './userListColumns';
	import { toast } from 'svelte-sonner';

	const { t } = useI18n();
	const shell = getAppShell();

	function handleOpenUser(user: UserListItem) {
		shell.navigateTo('UserDetail', { userId: user.id }, '#users');
	}

	// Inaktiválás/aktiválás
	let toggleDialogOpen = $state(false);
	let userToToggle = $state<UserListItem | null>(null);

	function handleToggleActive(user: UserListItem) {
		userToToggle = user;
		toggleDialogOpen = true;
	}

	function cancelToggle() {
		toggleDialogOpen = false;
		userToToggle = null;
	}

	async function confirmToggle() {
		if (!userToToggle) return;
		try {
			const result = await setUserActiveStatus({
				userId: userToToggle.id,
				isActive: !userToToggle.isActive
			});
			if (result.success) {
				toast.success(
					userToToggle.isActive
						? t('users.users.detail.deactivateSuccess')
						: t('users.users.detail.activateSuccess')
				);
				toggleDialogOpen = false;
				userToToggle = null;
				await loadData();
			} else {
				toast.error(result.error || t('users.users.detail.deactivateError'));
			}
		} catch (err) {
			console.error('Failed to toggle user active status:', err);
			toast.error(t('users.users.detail.deactivateError'));
		}
	}

	let data = $state<UserListItem[]>([]);
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
	let providerFilter = $state<string[]>([]);
	let searchFilter = $state('');

	let dataTable: DataTable<UserListItem>;
	const columns = $derived(
		createColumns({
			t,
			onSort: (id, desc) => dataTable.handleSort(id, desc),
			onOpen: handleOpenUser,
			onToggleActive: handleToggleActive
		})
	);

	const statusOptions = [
		{ value: 'true', label: t('users.users.filters.active') },
		{ value: 'false', label: t('users.users.filters.inactive') }
	];

	const providerOptions = [
		{ value: 'credential', label: t('users.users.providers.credential') },
		{ value: 'google', label: t('users.users.providers.google') },
		{ value: 'facebook', label: t('users.users.providers.facebook') },
		{ value: 'github', label: t('users.users.providers.github') }
	];

	let isFiltered = $derived(statusFilter.length > 0 || providerFilter.length > 0 || !!searchFilter);

	function handleStatusChange(values: string[]) {
		statusFilter = values;
	}

	function handleProviderChange(values: string[]) {
		providerFilter = values;
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
		providerFilter = [];
		searchFilter = '';
	}

	function handleStateChange(state: DataTableState) {
		tableState = state;
	}

	async function loadData() {
		loading = true;
		try {
			const isActive = statusFilter.length === 1 ? statusFilter[0] === 'true' : undefined;

			const result = await fetchUsers({
				page: tableState.page,
				pageSize: tableState.pageSize,
				sortBy: tableState.sortBy,
				sortOrder: tableState.sortOrder,
				isActive,
				providerId: providerFilter.length > 0 ? providerFilter : undefined,
				search: searchFilter || undefined
			});
			if (result.success) {
				data = result.data;
				paginationInfo = result.pagination;
			}
		} catch (err) {
			console.error('Failed to load users:', err);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		tableState;
		statusFilter;
		providerFilter;
		searchFilter;
		untrack(() => loadData());
	});
</script>

<div class="title-block">
	<h2>{t('users.users.list.label')}</h2>
	<h3>{t('users.users.list.description')}</h3>
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
			placeholder={t('users.users.filters.searchPlaceholder')}
			value={searchFilter}
			oninput={handleSearchInput}
			class="h-8 w-[150px] lg:w-[250px]"
		/>
		<DataTableFacetedFilter
			title={t('users.users.columns.isActive')}
			options={statusOptions}
			selectedValues={statusFilter}
			onValuesChange={handleStatusChange}
		/>
		<DataTableFacetedFilter
			title={t('users.users.columns.provider')}
			options={providerOptions}
			selectedValues={providerFilter}
			onValuesChange={handleProviderChange}
		/>
		{#if isFiltered}
			<Button variant="ghost" onclick={handleReset} class="h-8 px-2 lg:px-3">
				{t('users.users.filters.reset')}
				<X class="ml-2 size-4" />
			</Button>
		{/if}
	{/snippet}
</DataTable>

<ConfirmDialog
	bind:open={toggleDialogOpen}
	title={userToToggle?.isActive
		? t('users.users.detail.deactivateUser')
		: t('users.users.detail.activateUser')}
	description={userToToggle
		? userToToggle.isActive
			? t('users.users.detail.deactivateDescription', {
					name: userToToggle.name,
					email: userToToggle.email
				})
			: t('users.users.detail.activateDescription', {
					name: userToToggle.name,
					email: userToToggle.email
				})
		: ''}
	confirmText={userToToggle?.isActive
		? t('users.users.detail.deactivateConfirm')
		: t('users.users.detail.activateConfirm')}
	confirmVariant={userToToggle?.isActive ? 'destructive' : 'default'}
	onConfirm={confirmToggle}
	onCancel={cancelToggle}
/>
