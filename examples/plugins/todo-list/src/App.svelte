<svelte:options customElement="todo-list-plugin" />

<script lang="ts">
	/**
	 * Todo List Plugin
	 *
	 * Demonstrates DataService (key-value storage), UIService (toast),
	 * I18nService (translations), and ContextService usage.
	 */
	import { onMount } from 'svelte';
	import type {} from '@racona/sdk/types';

	let { pluginId = 'todo-list' }: { pluginId?: string } = $props();

	interface Todo {
		id: string;
		text: string;
		done: boolean;
		createdAt: number;
	}

	let sdk = $derived.by(() => {
		const instances = (window as any).__webOS_instances;
		return instances?.get(pluginId) || window.webOS;
	});

	let translationsLoaded = $state(false);
	let todos = $state<Todo[]>([]);
	let newTodoText = $state('');
	let filter = $state<'all' | 'active' | 'done'>('all');

	const filteredTodos = $derived(
		todos.filter((t) => {
			if (filter === 'active') return !t.done;
			if (filter === 'done') return t.done;
			return true;
		})
	);

	const remaining = $derived(todos.filter((t) => !t.done).length);
	const completedCount = $derived(todos.filter((t) => t.done).length);

	$effect(() => {
		if (sdk?.i18n) {
			sdk.i18n.ready().then(() => {
				translationsLoaded = true;
			});
		}
	});

	onMount(async () => {
		await sdk?.i18n?.ready();
		const saved = await sdk?.data?.get<Todo[]>('todos');
		if (saved) {
			todos = saved;
		}
	});

	async function saveTodos() {
		await sdk?.data?.set('todos', todos);
	}

	async function addTodo() {
		const text = newTodoText.trim();
		if (!text) return;

		const todo: Todo = {
			id: crypto.randomUUID(),
			text,
			done: false,
			createdAt: Date.now()
		};

		todos = [...todos, todo];
		newTodoText = '';
		await saveTodos();
		sdk?.ui?.toast(sdk.i18n.t('todo_added'), 'success');
	}

	async function toggleTodo(id: string) {
		todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
		const todo = todos.find((t) => t.id === id);
		await saveTodos();
		sdk?.ui?.toast(sdk.i18n.t(todo?.done ? 'todo_completed' : 'todo_uncompleted'), 'info');
	}

	async function removeTodo(id: string) {
		todos = todos.filter((t) => t.id !== id);
		await saveTodos();
		sdk?.ui?.toast(sdk.i18n.t('todo_removed'), 'warning');
	}

	async function clearCompleted() {
		todos = todos.filter((t) => !t.done);
		await saveTodos();
		sdk?.ui?.toast(sdk.i18n.t('cleared'), 'info');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') addTodo();
	}
</script>

{#if !translationsLoaded}
	<div class="loading">Loading...</div>
{:else}
	<div class="todo-app">
		<h1>{sdk?.i18n.t('title')}</h1>

		<!-- Add todo -->
		<div class="add-row">
			<input
				type="text"
				bind:value={newTodoText}
				placeholder={sdk?.i18n.t('add_placeholder')}
				onkeydown={handleKeydown}
				class="todo-input"
			/>
			<button onclick={addTodo} class="btn btn-add">
				{sdk?.i18n.t('add_button')}
			</button>
		</div>

		<!-- Filters -->
		<div class="filters">
			<button class="filter-btn" class:active={filter === 'all'} onclick={() => (filter = 'all')}>
				{sdk?.i18n.t('filter_all')}
			</button>
			<button
				class="filter-btn"
				class:active={filter === 'active'}
				onclick={() => (filter = 'active')}
			>
				{sdk?.i18n.t('filter_active')}
			</button>
			<button class="filter-btn" class:active={filter === 'done'} onclick={() => (filter = 'done')}>
				{sdk?.i18n.t('filter_done')}
			</button>
		</div>

		<!-- Todo list -->
		{#if filteredTodos.length === 0}
			<p class="empty">{sdk?.i18n.t('empty')}</p>
		{:else}
			<ul class="todo-list">
				{#each filteredTodos as todo (todo.id)}
					<li class="todo-item" class:done={todo.done}>
						<label class="todo-label">
							<input
								type="checkbox"
								checked={todo.done}
								onchange={() => toggleTodo(todo.id)}
								class="todo-checkbox"
							/>
							<span class="todo-text">{todo.text}</span>
						</label>
						<button onclick={() => removeTodo(todo.id)} class="btn-remove" aria-label="Remove">
							✕
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Footer -->
		<div class="footer">
			<span
				>{remaining} {sdk?.i18n.t('remaining')}, {completedCount} {sdk?.i18n.t('completed')}</span
			>
			{#if completedCount > 0}
				<button onclick={clearCompleted} class="btn-clear">
					{sdk?.i18n.t('clear_completed')}
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #6b7280;
	}

	.todo-app {
		margin: 0 auto;
		padding: 1.5rem;
		max-width: 600px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	h1 {
		margin: 0 0 1.5rem;
		color: #1f2937;
		font-size: 1.5rem;
	}

	.add-row {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.todo-input {
		flex: 1;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.95rem;
	}

	.todo-input:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
		border-color: #667eea;
	}

	.btn-add {
		cursor: pointer;
		border: none;
		border-radius: 0.375rem;
		background: #667eea;
		padding: 0.5rem 1rem;
		color: white;
		font-weight: 500;
	}

	.btn-add:hover {
		background: #5568d3;
	}

	.filters {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.filter-btn {
		cursor: pointer;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		background: white;
		padding: 0.25rem 0.75rem;
		color: #6b7280;
		font-size: 0.85rem;
	}

	.filter-btn.active {
		border-color: #667eea;
		background: #667eea;
		color: white;
	}

	.empty {
		padding: 2rem;
		color: #9ca3af;
		font-size: 0.9rem;
		text-align: center;
	}

	.todo-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.todo-item {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #f3f4f6;
		padding: 0.6rem 0;
	}

	.todo-item.done .todo-text {
		color: #9ca3af;
		text-decoration: line-through;
	}

	.todo-label {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.todo-checkbox {
		width: 1.1rem;
		height: 1.1rem;
		accent-color: #667eea;
	}

	.todo-text {
		color: #374151;
		font-size: 0.95rem;
	}

	.btn-remove {
		opacity: 0;
		transition: opacity 0.15s;
		cursor: pointer;
		border: none;
		background: none;
		padding: 0.25rem 0.5rem;
		color: #ef4444;
		font-size: 0.85rem;
	}

	.todo-item:hover .btn-remove {
		opacity: 1;
	}

	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 1rem;
		border-top: 1px solid #e5e7eb;
		padding-top: 0.75rem;
		color: #6b7280;
		font-size: 0.85rem;
	}

	.btn-clear {
		cursor: pointer;
		border: none;
		background: none;
		padding: 0.25rem 0.5rem;
		color: #667eea;
		font-size: 0.85rem;
	}

	.btn-clear:hover {
		text-decoration: underline;
	}
</style>
