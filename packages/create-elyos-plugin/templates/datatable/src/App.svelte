<script lang="ts">
	import DataTableView from './components/DataTableView.svelte';

	const sdk = window.webOS;
</script>

<div class="plugin-container">
	<h1>{sdk?.i18n.t('title') ?? 'DataTable Plugin'}</h1>
	<p>{sdk?.i18n.t('description') ?? 'CRUD operations with DataTable'}</p>

	<DataTableView />
</div>

<style>
	.plugin-container {
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}

	h1 {
		margin-bottom: 0.25rem;
	}

	p {
		margin-bottom: 1.5rem;
		color: #64748b;
	}
</style>
