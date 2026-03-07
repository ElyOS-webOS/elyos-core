import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import { createActionsColumn } from '$lib/components/ui/data-table';
import type { PluginListItem } from '../plugins.remote';

export interface PluginListColumnDeps extends ColumnDeps {
	onOpen: (plugin: PluginListItem) => void;
}

export function createColumns(deps: PluginListColumnDeps): ColumnDef<PluginListItem, unknown>[] {
	const { t, onSort, onOpen } = deps;

	return [
		{
			accessorKey: 'name',
			enableHiding: false,
			meta: { title: t('plugin-manager.list.columns.name') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('plugin-manager.list.columns.name');
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
			accessorKey: 'version',
			enableHiding: true,
			meta: { title: t('plugin-manager.list.columns.version') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('plugin-manager.list.columns.version');
					},
					onSort
				}),
			cell: ({ row }) => {
				const version = String(row.original.version);
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">${version}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'author',
			enableHiding: true,
			meta: { title: t('plugin-manager.list.columns.author') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('plugin-manager.list.columns.author');
					}
				}),
			cell: ({ row }) => {
				const author = row.original.author || '—';
				const snippet = createRawSnippet(() => ({
					render: () => `<span class="text-sm">${author}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'status',
			enableSorting: false,
			enableHiding: true,
			meta: { title: t('plugin-manager.list.columns.status') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('plugin-manager.list.columns.status');
					}
				}),
			cell: ({ row }) => {
				const status = row.original.status;
				const isActive = status === 'active';
				const label = isActive
					? t('plugin-manager.list.status.active')
					: t('plugin-manager.list.status.inactive');
				const snippet = createRawSnippet(() => ({
					render: () =>
						isActive
							? `<span class="text-xs font-medium text-green-600">● ${label}</span>`
							: `<span class="text-xs font-medium text-red-500">● ${label}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'installedAt',
			enableHiding: true,
			meta: { title: t('plugin-manager.list.columns.installedAt') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('plugin-manager.list.columns.installedAt');
					},
					onSort
				}),
			cell: ({ row }) => {
				const installedAt = row.original.installedAt;
				const formatted = installedAt
					? new Date(installedAt).toLocaleString(undefined, {
							year: 'numeric',
							month: '2-digit',
							day: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						})
					: '—';
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="text-muted-foreground whitespace-nowrap text-sm">${formatted}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		createActionsColumn<PluginListItem>((plugin) => [
			{
				label: t('plugin-manager.list.actions.viewDetails'),
				onClick: () => onOpen(plugin),
				primary: true
			}
		])
	];
}
