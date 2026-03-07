import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import { createActionsColumn } from '$lib/components/ui/data-table';
import type { GroupPermissionRow } from '$lib/server/database/repositories';

/** Csoport részletek jogosultság lista oszlopok függőségei. */
export interface GroupDetailPermissionColumnDeps extends ColumnDeps {
	onOpenPermission?: (permission: GroupPermissionRow) => void;
	onRemoveFromGroup?: (permission: GroupPermissionRow) => void;
}

/** Csoport részletek jogosultság lista oszlopdefiníciók. */
export function createColumns(
	deps: GroupDetailPermissionColumnDeps
): ColumnDef<GroupPermissionRow, unknown>[] {
	const { t, onSort, onOpenPermission, onRemoveFromGroup } = deps;

	const columns: ColumnDef<GroupPermissionRow, unknown>[] = [
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

	const actions = [];
	if (onRemoveFromGroup) {
		actions.push({
			label: t('users.groups.actions.removePermission'),
			onClick: (permission: GroupPermissionRow) => onRemoveFromGroup(permission),
			variant: 'destructive' as const,
			primary: true
		});
	}
	if (onOpenPermission) {
		actions.push({
			label: t('users.users.actions.open'),
			onClick: (permission: GroupPermissionRow) => onOpenPermission(permission)
		});
	}

	if (actions.length > 0) {
		columns.push(createActionsColumn<GroupPermissionRow>(actions));
	}

	return columns;
}
