<script lang="ts" generics="TData">
	import type { SortingState, VisibilityState } from '@tanstack/table-core';
	import { getCoreRowModel, getSortedRowModel } from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from './index';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import Settings2 from 'lucide-svelte/icons/settings-2';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { useI18n } from '$lib/i18n/hooks';
	import type { DataTableProps, DataTableState } from './types';

	const { t } = useI18n();

	let {
		columns,
		data,
		pagination: paginationInfo,
		loading = false,
		striped = false,
		pageSizes = [10, 20, 50, 100],
		initialSortBy,
		initialSortOrder = 'desc',
		initialPageSize = 20,
		onStateChange,
		toolbar
	}: DataTableProps<TData> = $props();

	// Internal state
	// svelte-ignore state_referenced_locally
	let page = $state(1);
	// svelte-ignore state_referenced_locally
	let pageSize = $state(initialPageSize);
	// svelte-ignore state_referenced_locally
	let sortBy = $state(initialSortBy ?? '');
	// svelte-ignore state_referenced_locally
	let sortOrder = $state<'asc' | 'desc'>(initialSortOrder);

	let sorting = $derived<SortingState>(sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []);
	let columnVisibility = $state<VisibilityState>({});

	const colCount = $derived(columns.length);

	function emitState() {
		onStateChange?.({ page, pageSize, sortBy, sortOrder });
	}

	/** Called by DataTableColumnHeader via onSort prop */
	export function handleSort(columnId: string, desc: boolean) {
		sortBy = columnId;
		sortOrder = desc ? 'desc' : 'asc';
		page = 1;
		emitState();
	}

	function setPage(newPage: number) {
		page = newPage;
		emitState();
	}

	function setPageSize(newSize: number) {
		pageSize = newSize;
		page = 1;
		emitState();
	}

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		manualPagination: true,
		manualSorting: true,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: () => {
			// Sorting is managed internally via handleSort
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		state: {
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			}
		}
	});
</script>

<div class="space-y-4">
	<!-- Toolbar -->
	{#if toolbar}
		<div class="flex items-center justify-between">
			<div class="flex flex-1 items-center space-x-2">
				{@render toolbar({ table, handleSort })}
			</div>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="outline" size="sm" class="ml-auto hidden h-8 lg:flex">
							<Settings2 class="mr-2 size-4" />
							{t('common.dataTable.columns')}
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="z-9999 w-[150px]">
					<DropdownMenu.Label>{t('common.dataTable.toggleColumns')}</DropdownMenu.Label>
					<DropdownMenu.Separator />
					{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
						<DropdownMenu.CheckboxItem
							class="capitalize"
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{(column.columnDef.meta as any)?.title ?? column.id}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}

	<!-- Table -->
	<div class="relative rounded-md border">
		{#if loading}
			<div class="bg-primary/10 absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden rounded-t-md">
				<div class="bg-primary shimmer-bar absolute inset-0 h-full w-1/3"></div>
			</div>
		{/if}
		<Table.Root>
			<Table.Header class="bg-primary/5">
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row class="border-primary/20 hover:bg-primary/5">
						{#each headerGroup.headers as header (header.id)}
							<Table.Head
								colspan={header.colSpan}
								class="text-primary/80 text-xs font-semibold tracking-wide"
							>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body
				class="transition-opacity duration-200 {loading
					? 'pointer-events-none opacity-40'
					: 'opacity-100'}"
			>
				{#each table.getRowModel().rows as row, i (row.id)}
					<Table.Row class={striped && i % 2 === 1 ? 'bg-muted/30' : ''}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={colCount} class="h-24 text-center">
							{t('common.dataTable.noResults')}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Pagination -->
	<div class="flex flex-wrap items-center justify-between gap-4 px-2">
		<div class="text-muted-foreground text-sm whitespace-nowrap">
			{t('common.dataTable.totalRows')}: {paginationInfo.totalCount}
			{t('common.dataTable.rows')}
		</div>
		<div class="flex flex-wrap items-center gap-4">
			<div class="flex items-center gap-2">
				<span class="text-sm whitespace-nowrap">{t('common.dataTable.rowsPerPage')}</span>
				<select
					class="border-input bg-background h-8 rounded-md border px-2 text-sm"
					value={paginationInfo.pageSize}
					onchange={(e) => {
						const val = Number((e.target as HTMLSelectElement).value);
						if (val) setPageSize(val);
					}}
				>
					{#each pageSizes as size}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-wrap items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					onclick={() => setPage(1)}
					disabled={paginationInfo.page <= 1 || loading}
				>
					«
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => setPage(paginationInfo.page - 1)}
					disabled={paginationInfo.page <= 1 || loading}
				>
					{t('common.dataTable.previous')}
				</Button>
				{#each Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
					const totalPages = paginationInfo.totalPages;
					const currentPage = paginationInfo.page;
					if (totalPages <= 5) return i + 1;
					if (currentPage <= 3) return i + 1;
					if (currentPage >= totalPages - 2) return totalPages - 4 + i;
					return currentPage - 2 + i;
				}) as pageNum}
					<Button
						variant={pageNum === paginationInfo.page ? 'default' : 'outline'}
						size="sm"
						onclick={() => setPage(pageNum)}
						disabled={loading}
						class="min-w-10"
					>
						{pageNum}
					</Button>
				{/each}
				<Button
					variant="outline"
					size="sm"
					onclick={() => setPage(paginationInfo.page + 1)}
					disabled={paginationInfo.page >= paginationInfo.totalPages || loading}
				>
					{t('common.dataTable.next')}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onclick={() => setPage(paginationInfo.totalPages)}
					disabled={paginationInfo.page >= paginationInfo.totalPages || loading}
				>
					»
				</Button>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(400%);
		}
	}

	.shimmer-bar {
		animation: shimmer 1.2s ease-in-out infinite;
	}
</style>
