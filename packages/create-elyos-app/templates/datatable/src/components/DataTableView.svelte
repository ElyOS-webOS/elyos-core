<script lang="ts">
	import { columns, type Item } from './columns.js';

	const sdk = window.webOS;

	let items = $state<Item[]>([]);
	let loading = $state(false);
	let newName = $state('');
	let newEmail = $state('');

	async function loadItems() {
		loading = true;
		try {
			const result = await sdk?.remote.call<Item[]>('listItems');
			items = result ?? [];
		} catch (error) {
			sdk?.ui.toast(`Error: ${(error as Error).message}`, 'error');
		} finally {
			loading = false;
		}
	}

	async function addItem() {
		if (!newName.trim() || !newEmail.trim()) {
			sdk?.ui.toast('Name and email required', 'warning');
			return;
		}
		try {
			await sdk?.remote.call('createItem', { name: newName, email: newEmail });
			sdk?.ui.toast('Item created', 'success');
			newName = '';
			newEmail = '';
			await loadItems();
		} catch (error) {
			sdk?.ui.toast(`Error: ${(error as Error).message}`, 'error');
		}
	}

	async function deleteItem(id: string) {
		try {
			await sdk?.remote.call('deleteItem', { id });
			sdk?.ui.toast('Item deleted', 'success');
			await loadItems();
		} catch (error) {
			sdk?.ui.toast(`Error: ${(error as Error).message}`, 'error');
		}
	}

	loadItems();
</script>

<div class="datatable">
	<div class="add-form">
		<input type="text" bind:value={newName} placeholder="Name" />
		<input type="email" bind:value={newEmail} placeholder="Email" />
		<button onclick={addItem}>Add</button>
	</div>

	{#if loading}
		<p class="loading">Loading...</p>
	{:else}
		<table>
			<thead>
				<tr>
					{#each columns as col}
						<th>{col.header}</th>
					{/each}
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item (item.id)}
					<tr>
						{#each columns as col}
							<td>{item[col.accessorKey]}</td>
						{/each}
						<td>
							<button class="delete" onclick={() => deleteItem(item.id)}>Delete</button>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan={columns.length + 1} class="empty">No items</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.datatable {
		margin-top: 1rem;
	}

	.add-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.add-form input {
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.5rem;
	}

	.add-form button {
		cursor: pointer;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	th,
	td {
		border-bottom: 1px solid #e2e8f0;
		padding: 0.5rem 0.75rem;
		text-align: left;
	}

	th {
		background: #f8fafc;
		font-weight: 600;
	}

	.empty {
		color: #94a3b8;
		text-align: center;
	}
	.loading {
		color: #64748b;
	}

	.delete {
		cursor: pointer;
		border: 1px solid #fca5a5;
		border-radius: 0.25rem;
		background: none;
		padding: 0.25rem 0.5rem;
		color: #dc2626;
		font-size: 0.875rem;
	}
</style>
