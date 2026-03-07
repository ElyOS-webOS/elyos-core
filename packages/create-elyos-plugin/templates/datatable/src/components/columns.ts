/**
 * DataTable oszlop definíciók
 */

export interface Item {
	id: string;
	name: string;
	email: string;
	createdAt: string;
}

export interface Column {
	header: string;
	accessorKey: keyof Item;
}

export const columns: Column[] = [
	{ header: 'ID', accessorKey: 'id' },
	{ header: 'Name', accessorKey: 'name' },
	{ header: 'Email', accessorKey: 'email' },
	{ header: 'Created', accessorKey: 'createdAt' }
];
