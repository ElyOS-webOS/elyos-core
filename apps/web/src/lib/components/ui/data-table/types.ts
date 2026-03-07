import type { ColumnDef, SortingState, Table } from '@tanstack/table-core';
import type { Snippet } from 'svelte';

export interface PaginationInfo {
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

export interface DataTableState {
	page: number;
	pageSize: number;
	sortBy: string;
	sortOrder: 'asc' | 'desc';
}

/** Common dependencies for column definition factory functions */
export interface ColumnDeps {
	t: (key: string) => string;
	onSort: (id: string, desc: boolean) => void;
}

export interface DataTableProps<TData> {
	/** Column definitions for the table */
	columns: ColumnDef<TData, any>[];
	/** Table data */
	data: TData[];
	/** Pagination info from server */
	pagination: PaginationInfo;
	/** Loading state */
	loading?: boolean;
	/** Enable striped rows */
	striped?: boolean;
	/** Available page sizes */
	pageSizes?: number[];
	/** Initial sorting column id */
	initialSortBy?: string;
	/** Initial sort direction */
	initialSortOrder?: 'asc' | 'desc';
	/** Initial page size */
	initialPageSize?: number;
	/** Called when any table state changes (page, pageSize, sort) */
	onStateChange?: (state: DataTableState) => void;
	/** Toolbar snippet - receives the table instance and handleSort for column headers */
	toolbar?: Snippet<[{ table: Table<TData>; handleSort: (id: string, desc: boolean) => void }]>;
}
