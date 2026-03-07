import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet,
	createActionsColumn
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import type { PermissionWithResource } from '$lib/server/database/repositories/permissionRepository';

interface PermissionColumnDeps extends ColumnDeps {
	onOpen: (permission: PermissionWithResource) => void;
}

/** Jogosultságok lista oszlopdefiníciók */
export function createColumns(
	deps: PermissionColumnDeps
): ColumnDef<PermissionWithResource, unknown>[] {
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
						return t('users.permissions.columns.name');
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
						return t('users.permissions.columns.description');
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
			accessorKey: 'resourceName',
			enableSorting: false,
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.permissions.columns.resourceName');
					}
				}),
			cell: ({ row }) => {
				const resourceName = row.original.resourceName;
				const snippet = createRawSnippet(() => ({
					render: () =>
						resourceName
							? `<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">${resourceName}</span>`
							: `<span class="text-muted-foreground text-xs">—</span>`
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
						return t('users.permissions.columns.createdAt');
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
		createActionsColumn<PermissionWithResource>([
			{
				label: t('users.users.actions.open'),
				onClick: (permission) => onOpen(permission)
			}
		])
	];
}
