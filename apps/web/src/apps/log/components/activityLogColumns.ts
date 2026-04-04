import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import type { ActivityEntry } from '$lib/server/activity-log/types';

/** Activity log oszlopdefiníciók */
export function createColumns(deps: ColumnDeps): ColumnDef<ActivityEntry, unknown>[] {
	const { t, onSort } = deps;

	return [
		{
			accessorKey: 'translatedAction',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('log.activity.columns.action');
					},
					onSort
				}),
			cell: ({ row }) => {
				const action = String(row.original.translatedAction ?? row.original.actionKey);
				const escaped = action.replace(/"/g, '&quot;');
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<div class="max-w-[400px] truncate font-medium" title="${escaped}">${action}</div>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'userId',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('log.activity.columns.userId');
					},
					onSort
				}),
			cell: ({ row }) => {
				const userId = row.original.userId ?? '—';
				const snippet = createRawSnippet(() => ({
					render: () => `<span class="text-muted-foreground text-sm">${userId}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			id: 'resource',
			enableSorting: false,
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('log.activity.columns.resource');
					}
				}),
			cell: ({ row }) => {
				const { resourceType, resourceId } = row.original;
				const resource =
					resourceType && resourceId
						? `${resourceType}:${resourceId}`
						: (resourceType ?? resourceId ?? '—');
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">${resource}</span>`
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
						return t('log.activity.columns.createdAt');
					},
					onSort
				}),
			cell: ({ row }) => {
				const createdAt = String(row.original.createdAt);
				const formatted = new Date(createdAt).toLocaleString();
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="text-muted-foreground whitespace-nowrap text-sm">${formatted}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		}
	];
}
