import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import { createActionsColumn } from '$lib/components/ui/data-table';
import type { GroupAppRow } from '$lib/server/database/repositories';
import AppNameCell from './AppNameCell.svelte';

/** Csoport részletek app lista oszlopok függőségei. */
export interface GroupDetailAppColumnDeps extends ColumnDeps {
	onOpenApp?: (app: GroupAppRow) => void;
	onRemoveFromGroup?: (app: GroupAppRow) => void;
}

/** Csoport részletek app lista oszlopdefiníciók. */
export function createColumns(deps: GroupDetailAppColumnDeps): ColumnDef<GroupAppRow, unknown>[] {
	const { t, onSort, onOpenApp, onRemoveFromGroup } = deps;

	const columns: ColumnDef<GroupAppRow, unknown>[] = [
		{
			accessorKey: 'name',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.apps.columns.name');
					},
					onSort
				}),
			cell: ({ row }) => {
				return renderComponent(AppNameCell, {
					get app() {
						return row.original;
					}
				});
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
						return t('users.apps.columns.description');
					}
				}),
			cell: ({ row }) => {
				const descObj = row.original.description as any;
				const description =
					typeof descObj === 'object' && descObj !== null
						? descObj?.hu || descObj?.en || '—'
						: (descObj ?? '—');
				const escaped = description.replace(/</g, '&lt;').replace(/>/g, '&gt;');
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<div class="max-w-[400px] truncate text-sm" title="${escaped}">${escaped}</div>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'category',
			enableSorting: false,
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.apps.columns.category');
					}
				}),
			cell: ({ row }) => {
				const category = row.original.category;
				const snippet = createRawSnippet(() => ({
					render: () => `<span class="text-sm">${category}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		}
	];

	const actions = [];
	if (onRemoveFromGroup) {
		actions.push({
			label: t('users.groups.actions.removeApp'),
			onClick: (app: GroupAppRow) => onRemoveFromGroup(app),
			variant: 'destructive' as const,
			primary: true
		});
	}
	if (onOpenApp) {
		actions.push({
			label: t('users.apps.actions.open'),
			onClick: (app: GroupAppRow) => onOpenApp(app)
		});
	}

	if (actions.length > 0) {
		columns.push(createActionsColumn<GroupAppRow>(actions));
	}

	return columns;
}
