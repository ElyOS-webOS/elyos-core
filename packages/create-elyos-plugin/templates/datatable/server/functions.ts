/**
 * Szerver oldali CRUD függvények
 *
 * Ezek a függvények az ElyOS szerveren futnak,
 * és a plugin a remote.call()-lal hívhatja őket.
 */

interface Item {
	id: string;
	name: string;
	email: string;
	createdAt: string;
}

// In-memory tároló (éles környezetben DB lenne)
const items: Item[] = [
	{ id: '1', name: 'John Doe', email: 'john@example.com', createdAt: new Date().toISOString() },
	{ id: '2', name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date().toISOString() }
];

let nextId = 3;

export async function listItems(): Promise<Item[]> {
	return items;
}

export async function createItem(params: { name: string; email: string }): Promise<Item> {
	const item: Item = {
		id: String(nextId++),
		name: params.name,
		email: params.email,
		createdAt: new Date().toISOString()
	};
	items.push(item);
	return item;
}

export async function deleteItem(params: { id: string }): Promise<{ success: boolean }> {
	const index = items.findIndex((i) => i.id === params.id);
	if (index === -1) {
		throw new Error('Item not found');
	}
	items.splice(index, 1);
	return { success: true };
}
