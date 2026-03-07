import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet,
	createActionsColumn
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';

interface ResourceRow {
	id: number;
	name: string;
	description: string | null;
	createdAt: Date | null;
}

interface ResourceColumnDeps extends ColumnDeps {
	onOpen: (resource: ResourceRow) => void;
}

/** Erőforrások lista oszlopdefiníciók */
export function createColumns(deps: ResourceColumnDeps): ColumnDef<ResourceRow, unknown>[] {
	const { t, onSort, onOpen } = deps;

	return [
		{
			accessorKey: 'name',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.resources.columns.name');
					},
					onSort
				}),
			cell: ({ row }) => {
				const name = String(row.original.name);
				const snippet = createRawSnippet(() => ({
					render: () => `<span class="font-medium">${name}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'description',
			enableSorting: false,
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.resources.columns.description');
					}
				}),
			cell: ({ row }) => {
				const description = row.original.description ?? '—';
				const escaped = description.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<div class="max-w-[400px] truncate text-sm" title="${escaped}">${escaped}</div>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'createdAt',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.resources.columns.createdAt');
					},
					onSort
				}),
			cell: ({ row }) => {
				const createdAt = row.original.createdAt;
				const formatted = createdAt ? new Date(createdAt).toLocaleDateString() : '—';
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="text-muted-foreground whitespace-nowrap text-sm">${formatted}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		createActionsColumn<ResourceRow>([
			{
				label: t('users.users.actions.open'),
				onClick: (resource) => onOpen(resource)
			}
		])
	];
}
