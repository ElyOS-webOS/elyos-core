import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import { createActionsColumn } from '$lib/components/ui/data-table';
import type { RolePermissionRow } from '$lib/server/database/repositories';

/** Szerepkör részletek jogosultság lista oszlopok függőségei. */
export interface RoleDetailPermissionColumnDeps extends ColumnDeps {
	onOpenPermission?: (permission: RolePermissionRow) => void;
	onRemoveFromRole?: (permission: RolePermissionRow) => void;
}

/** Szerepkör részletek jogosultság lista oszlopdefiníciók. */
export function createColumns(
	deps: RoleDetailPermissionColumnDeps
): ColumnDef<RolePermissionRow, unknown>[] {
	const { t, onSort, onOpenPermission, onRemoveFromRole } = deps;

	const columns: ColumnDef<RolePermissionRow, unknown>[] = [
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
		}
	];

	// Műveletek oszlop
	const actions = [];
	if (onRemoveFromRole) {
		actions.push({
			label: t('users.roles.actions.removePermission'),
			onClick: (permission: RolePermissionRow) => onRemoveFromRole(permission),
			variant: 'destructive' as const,
			primary: true
		});
	}
	if (onOpenPermission) {
		actions.push({
			label: t('users.users.actions.open'),
			onClick: (permission: RolePermissionRow) => onOpenPermission(permission)
		});
	}

	if (actions.length > 0) {
		columns.push(createActionsColumn<RolePermissionRow>(actions));
	}

	return columns;
}
