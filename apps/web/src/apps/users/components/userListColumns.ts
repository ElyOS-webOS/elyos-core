import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import {
	DataTableColumnHeader,
	renderComponent,
	renderSnippet
} from '$lib/components/ui/data-table';
import type { ColumnDeps } from '$lib/components/ui/data-table';
import { createActionsColumn } from '$lib/components/ui/data-table';
import type { UserListItem } from '$lib/server/database/repositories';

/** Felhasználók lista oszlopok függőségei, kiegészítve megnyitás callback-kel. */
export interface UserListColumnDeps extends ColumnDeps {
	onOpen: (user: UserListItem) => void;
	onToggleActive: (user: UserListItem) => void;
}

/** Felhasználók lista oszlopdefiníciók. */
export function createColumns(deps: UserListColumnDeps): ColumnDef<UserListItem, unknown>[] {
	const { t, onSort, onOpen, onToggleActive } = deps;

	return [
		{
			accessorKey: 'name',
			enableHiding: false,
			meta: { title: t('users.users.columns.name') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.users.columns.name');
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
			accessorKey: 'email',
			enableHiding: false,
			meta: { title: t('users.users.columns.email') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.users.columns.email');
					},
					onSort
				}),
			cell: ({ row }) => {
				const email = String(row.original.email);
				const snippet = createRawSnippet(() => ({
					render: () => `<span class="text-sm">${email}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'isActive',
			enableSorting: false,
			enableHiding: true,
			meta: { title: t('users.users.columns.isActive') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.users.columns.isActive');
					}
				}),
			cell: ({ row }) => {
				const active = row.original.isActive;
				const label = active ? t('users.users.filters.active') : t('users.users.filters.inactive');
				const snippet = createRawSnippet(() => ({
					render: () =>
						active
							? `<span class="text-xs font-medium text-green-600">● ${label}</span>`
							: `<span class="text-xs font-medium text-red-500">● ${label}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'providerId',
			enableSorting: false,
			enableHiding: true,
			meta: { title: t('users.users.columns.provider') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.users.columns.provider');
					}
				}),
			cell: ({ row }) => {
				const provider = String(row.original.providerId);
				const snippet = createRawSnippet(() => ({
					render: () =>
						`<span class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">${provider}</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'emailVerified',
			enableSorting: false,
			enableHiding: true,
			meta: { title: t('users.users.columns.emailVerified') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.users.columns.emailVerified');
					}
				}),
			cell: ({ row }) => {
				const verified = row.original.emailVerified;
				const snippet = createRawSnippet(() => ({
					render: () =>
						verified
							? `<span class="text-xs font-medium text-green-600">✓</span>`
							: `<span class="text-xs font-medium text-red-500">✗</span>`
				}));
				return renderSnippet(snippet, {});
			}
		},
		{
			accessorKey: 'createdAt',
			enableHiding: true,
			meta: { title: t('users.users.columns.createdAt') },
			header: ({ column }) =>
				renderComponent(DataTableColumnHeader, {
					get column() {
						return column;
					},
					get title() {
						return t('users.users.columns.createdAt');
					},
					onSort
				}),
			cell: ({ row }) => {
				const createdAt = row.original.createdAt;
				const formatted = createdAt
					? new Date(createdAt).toLocaleString(undefined, {
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
		createActionsColumn<UserListItem>((user) => [
			{
				label: t('users.users.actions.open'),
				onClick: () => onOpen(user),
				primary: true
			},
			{
				label: user.isActive
					? t('users.users.detail.deactivateUser')
					: t('users.users.detail.activateUser'),
				onClick: () => onToggleActive(user),
				variant: user.isActive ? 'destructive' : 'default'
			}
		])
	];
}
