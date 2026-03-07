import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import type { LogEntry } from '$lib/server/logging/types';

/** Error log oszlopdefiníciók */
export function createColumns(deps: ColumnDeps): ColumnDef<LogEntry, unknown>[] {
	const { t, onSort } = deps;

	return [
		{
			accessorKey: 'level',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('log.error.columns.level');
					},
					onSort
				}),
			cell: ({ row }) => {
				const level = String(row.original.level);
				const colorMap: Record<string, string> = {
					debug: 'text-gray-500',
					info: 'text-blue-500',
					warn: 'text-yellow-500',
					error: 'text-red-500',
					fatal: 'text-red-700 font-bold'
				};
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="${colorMap[level] ?? ''} uppercase text-xs font-medium">${level}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'message',
			enableSorting: false,
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('log.error.columns.message');
					}
				}),
			cell: ({ row }) => {
				const message = String(row.original.message);
				const escaped = message.replace(/"/g, '&quot;');
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<div class="max-w-[500px] truncate font-medium" title="${escaped}">${message}</div>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'source',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('log.error.columns.source');
					},
					onSort
				}),
			cell: ({ row }) => {
				const source = String(row.original.source);
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">${source}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'timestamp',
			enableHiding: true,
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('log.error.columns.timestamp');
					},
					onSort
				}),
			cell: ({ row }) => {
				const timestamp = String(row.original.timestamp);
				const formatted = new Date(timestamp).toLocaleString();
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="text-muted-foreground whitespace-nowrap text-sm">${formatted}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		}
	];
}
