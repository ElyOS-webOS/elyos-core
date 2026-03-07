<svelte:options customElement={{ tag: 'hello-world-datatable', shadow: 'none' }} />

<script module>
	// Factory function export for dynamic loading
	if (typeof window !== 'undefined') {
		(window as any).hello_world_Component_DataTableDemo = function () {
			return {
				tagName: 'hello-world-datatable'
			};
		};
	}
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type {} from '@elyos/sdk/types';

	let { pluginId = 'hello-world' }: { pluginId?: string } = $props();

	// SDK elérése
	let sdk = $derived.by(() => {
		const instances = (window as any).__webOS_instances;
		return instances?.get(pluginId) || window.webOS;
	});

	// Fordítások betöltése
	let translationsLoaded = $state(false);

	$effect(() => {
		if (sdk?.i18n) {
			sdk.i18n.ready().then(() => {
				translationsLoaded = true;
			});
		}
	});

	// DataTable komponensek közvetlenül az SDK-ból - derived, hogy reaktívak legyenek
	const DataTable = $derived(sdk?.components?.DataTable);
	const DataTableColumnHeader = $derived(sdk?.components?.DataTableColumnHeader);
	const DataTableFacetedFilter = $derived(sdk?.components?.DataTableFacetedFilter);
	const renderComponent = $derived(sdk?.components?.renderComponent);
	const renderSnippet = $derived(sdk?.components?.renderSnippet);
	const createActionsColumn = $derived(sdk?.components?.createActionsColumn);
	const Input = $derived(sdk?.components?.Input);
	const Button = $derived(sdk?.components?.Button);
	let createRawSnippet: any = $state(null);

	// Adatok
	let data = $state<any[]>([]);
	let loading = $state(false);
	let searchFilter = $state('');
	let statusFilter = $state<string[]>([]);
	let paginationInfo = $state({
		page: 1,
		pageSize: 10,
		totalCount: 0,
		totalPages: 0
	});
	let tableState = $state({
		page: 1,
		pageSize: 10,
		sortBy: 'id',
		sortOrder: 'asc' as 'asc' | 'desc'
	});

	let dataTable: any = $state(null);

	// Oszlopok létrehozása - state-ként, hogy újraszámolódjon onMount után
	let columns = $state<any[]>([]);

	function updateColumns() {
		if (
			!DataTableColumnHeader ||
			!renderComponent ||
			!renderSnippet ||
			!createRawSnippet ||
			!createActionsColumn ||
			!sdk?.i18n
		) {
			columns = [];
			return;
		}

		const t = (key: string) => sdk.i18n.t(key);

		// Rendezés kezelő függvény
		const handleSort = (columnId: string, descending: boolean) => {
			tableState = {
				...tableState,
				sortBy: columnId,
				sortOrder: descending ? 'desc' : 'asc',
				page: 1 // Rendezéskor vissza az első oldalra
			};
		};

		const actionsColumn = createActionsColumn([
			{
				label: t('datatable.actions.view'),
				onClick: (row: any) => handleView(row)
			},
			{
				label: t('datatable.actions.edit'),
				onClick: (row: any) => handleEdit(row)
			},
			{
				label: t('datatable.actions.delete'),
				onClick: (row: any) => handleDelete(row)
			}
		]);

		columns = [
			{
				accessorKey: 'id',
				enableHiding: true,
				meta: { title: t('datatable.columns.id') },
				header: ({ column }: any) =>
					renderComponent(DataTableColumnHeader, {
						get column() {
							return column;
						},
						get title() {
							return t('datatable.columns.id');
						},
						onSort: handleSort
					}),
				cell: ({ row }: any) => {
					const id = String(row.original.id);
					const snippet = createRawSnippet(() => ({
						render: () => `<span class="font-mono text-sm">#${id}</span>`
					}));
					return renderSnippet(snippet, {});
				}
			},
			{
				accessorKey: 'name',
				enableHiding: true,
				meta: { title: t('datatable.columns.name') },
				header: ({ column }: any) =>
					renderComponent(DataTableColumnHeader, {
						get column() {
							return column;
						},
						get title() {
							return t('datatable.columns.name');
						},
						onSort: handleSort
					}),
				cell: ({ row }: any) => {
					const name = String(row.original.name);
					const snippet = createRawSnippet(() => ({
						render: () => `<span class="font-medium">${name}</span>`
					}));
					return renderSnippet(snippet, {});
				}
			},
			{
				accessorKey: 'email',
				enableHiding: true,
				meta: { title: t('datatable.columns.email') },
				header: ({ column }: any) =>
					renderComponent(DataTableColumnHeader, {
						get column() {
							return column;
						},
						get title() {
							return t('datatable.columns.email');
						},
						onSort: handleSort
					}),
				cell: ({ row }: any) => {
					const email = String(row.original.email);
					const snippet = createRawSnippet(() => ({
						render: () => `<span class="text-sm text-muted-foreground">${email}</span>`
					}));
					return renderSnippet(snippet, {});
				}
			},
			{
				accessorKey: 'status',
				enableHiding: true,
				meta: { title: t('datatable.columns.status') },
				header: ({ column }: any) =>
					renderComponent(DataTableColumnHeader, {
						get column() {
							return column;
						},
						get title() {
							return t('datatable.columns.status');
						},
						onSort: handleSort
					}),
				cell: ({ row }: any) => {
					const status = String(row.original.status);
					const colorClass =
						status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
					const snippet = createRawSnippet(() => ({
						render: () =>
							`<span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClass}">${status}</span>`
					}));
					return renderSnippet(snippet, {});
				}
			},
			{
				accessorKey: 'createdAt',
				enableHiding: true,
				meta: { title: t('datatable.columns.createdAt') },
				header: ({ column }: any) =>
					renderComponent(DataTableColumnHeader, {
						get column() {
							return column;
						},
						get title() {
							return t('datatable.columns.createdAt');
						},
						onSort: handleSort
					}),
				cell: ({ row }: any) => {
					const createdAt = row.original.createdAt;
					const formatted = createdAt ? new Date(createdAt).toLocaleDateString() : '—';
					const snippet = createRawSnippet(() => ({
						render: () =>
							`<span class="text-sm text-muted-foreground whitespace-nowrap">${formatted}</span>`
					}));
					return renderSnippet(snippet, {});
				}
			},
			actionsColumn
		];
	}

	function handleStateChange(state: any) {
		tableState = state;
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	let debouncedSearchFilter = $state('');

	const statusOptions = [
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' }
	];

	let isFiltered = $derived(statusFilter.length > 0 || !!searchFilter);

	function handleStatusChange(values: string[]) {
		statusFilter = values;
	}

	function handleReset() {
		statusFilter = [];
		searchFilter = '';
		debouncedSearchFilter = '';
	}

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		// Azonnal frissítjük a searchFilter-t az Input számára
		searchFilter = value;

		// Debounce a tényleges kereséshez
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedSearchFilter = value;
			// Keresés esetén vissza az első oldalra
			if (tableState.page !== 1) {
				tableState = { ...tableState, page: 1 };
			}
		}, 300);
	}

	async function loadData() {
		console.log('[DataTableDemo] loadData started', {
			tableState,
			debouncedSearchFilter,
			columnsLength: columns.length
		});
		loading = true;
		try {
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Mock adatok generálása
			const startIndex = (tableState.page - 1) * tableState.pageSize;
			const mockData = Array.from({ length: 50 }, (_, i) => ({
				id: i + 1,
				name: `User ${i + 1}`,
				email: `user${i + 1}@example.com`,
				status: i % 3 === 0 ? 'active' : 'inactive',
				createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
			}));

			// Szűrés keresés alapján (először szűrünk)
			let filteredData = mockData;
			if (debouncedSearchFilter) {
				const searchLower = debouncedSearchFilter.toLowerCase();
				filteredData = mockData.filter(
					(item) =>
						item.name.toLowerCase().includes(searchLower) ||
						item.email.toLowerCase().includes(searchLower)
				);
			}

			// Szűrés státusz alapján
			if (statusFilter.length > 0) {
				filteredData = filteredData.filter((item) => statusFilter.includes(item.status));
			}

			// Rendezés (a szűrt adatokon)
			if (tableState.sortBy) {
				filteredData.sort((a: any, b: any) => {
					const aVal = a[tableState.sortBy];
					const bVal = b[tableState.sortBy];
					if (tableState.sortOrder === 'asc') {
						return aVal > bVal ? 1 : -1;
					} else {
						return aVal < bVal ? 1 : -1;
					}
				});
			}

			// Lapozás
			data = filteredData.slice(startIndex, startIndex + tableState.pageSize);
			paginationInfo = {
				page: tableState.page,
				pageSize: tableState.pageSize,
				totalCount: filteredData.length,
				totalPages: Math.ceil(filteredData.length / tableState.pageSize)
			};
			console.log('[DataTableDemo] loadData finished', {
				dataLength: data.length,
				filteredDataLength: filteredData.length,
				paginationInfo
			});
		} catch (err) {
			console.error('Failed to load data:', err);
			sdk?.ui.toast('Failed to load data', 'error');
		} finally {
			loading = false;
		}
	}

	function handleView(row: any) {
		sdk?.ui.toast(`Viewing: ${row.name}`, 'info');
	}

	function handleEdit(row: any) {
		sdk?.ui.toast(`Editing: ${row.name}`, 'info');
	}

	function handleDelete(row: any) {
		sdk?.ui.toast(`Deleting: ${row.name}`, 'warning');
	}

	$effect(() => {
		const state = {
			page: tableState.page,
			pageSize: tableState.pageSize,
			sortBy: tableState.sortBy,
			sortOrder: tableState.sortOrder,
			columnsLength: columns.length
		};
		console.log('[DataTableDemo] Effect triggered', state);
		untrack(() => {
			if (columns.length > 0) {
				console.log('[DataTableDemo] Calling loadData');
				loadData();
			}
		});
	});

	// Külön effect a debouncedSearchFilter és statusFilter figyelésére
	$effect(() => {
		debouncedSearchFilter;
		statusFilter;
		console.log('[DataTableDemo] Filter changed:', { debouncedSearchFilter, statusFilter });
		untrack(() => {
			if (columns.length > 0) {
				console.log('[DataTableDemo] Calling loadData due to filter');
				loadData();
			}
		});
	});

	onMount(async () => {
		try {
			const svelteModule = await import('svelte');
			createRawSnippet = svelteModule.createRawSnippet;
		} catch (error) {
			console.error('Failed to load Svelte:', error);
		}

		updateColumns();
	});
</script>

<section>
	<h2>
		{translationsLoaded ? sdk?.i18n.t('datatable.title') : 'Loading...'}
	</h2>
	<p style="margin-bottom: 1.5rem; color: var(--color-neutral-600);">
		{translationsLoaded ? sdk?.i18n.t('datatable.description') : ''}
	</p>

	{#if DataTable && columns.length > 0}
		{@const dataInfo = { length: data.length, loading, totalCount: paginationInfo.totalCount }}
		{@const _log = console.log('[DataTableDemo] Rendering DataTable', dataInfo)}
		{#key data}
			<!-- svelte-ignore svelte_component_deprecated -->
			<svelte:component
				this={DataTable}
				bind:this={dataTable}
				{columns}
				{data}
				pagination={paginationInfo}
				{loading}
				striped
				initialSortBy="id"
				initialSortOrder="asc"
				onStateChange={handleStateChange}
			>
				{#snippet toolbar()}
					{#if Input}
						<!-- svelte-ignore svelte_component_deprecated -->
						<svelte:component
							this={Input}
							placeholder={sdk?.i18n.t('datatable.search.placeholder')}
							value={searchFilter}
							oninput={handleSearchInput}
							class="h-8 w-[150px] lg:w-[250px]"
						/>
					{/if}
					{#if DataTableFacetedFilter}
						<!-- svelte-ignore svelte_component_deprecated -->
						<svelte:component
							this={DataTableFacetedFilter}
							title={sdk?.i18n.t('datatable.columns.status')}
							options={statusOptions}
							selectedValues={statusFilter}
							onValuesChange={handleStatusChange}
						/>
					{/if}
					{#if isFiltered && Button}
						<!-- svelte-ignore svelte_component_deprecated -->
						<svelte:component
							this={Button}
							variant="ghost"
							onclick={handleReset}
							class="h-8 px-2 lg:px-3"
						>
							{sdk?.i18n.t('datatable.filters.reset')}
						</svelte:component>
					{/if}
				{/snippet}
			</svelte:component>
		{/key}
	{:else}
		<div style="padding: 2rem; text-align: center;">
			<div class="spinner"></div>
			<p>Initializing table...</p>
		</div>
	{/if}
</section>

<style>
	:host {
		/* Inherit CSS variables from parent (WebOS theme) */
		all: inherit;
		display: block;
	}

	.spinner {
		animation: spin 0.8s linear infinite;
		margin: 0 auto 1rem;
		border: 3px solid #e5e7eb;
		border-top-color: #667eea;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
