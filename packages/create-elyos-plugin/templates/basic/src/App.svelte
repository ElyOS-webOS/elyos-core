<script lang="ts">
	const sdk = window.webOS;

	let count = $state(0);

	function showToast() {
		sdk?.ui.toast(`Count: ${count}`, 'success');
	}

	function increment() {
		count++;
		showToast();
	}
</script>

<div class="plugin-container">
	<h1>{sdk?.i18n.t('title') ?? 'My Plugin'}</h1>
	<p>{sdk?.i18n.t('welcome') ?? 'Welcome!'}</p>

	<div class="counter">
		<button onclick={increment}>+</button>
		<span>{count}</span>
	</div>
</div>

<style>
	.plugin-container {
		padding: 2rem;
		font-family: system-ui, sans-serif;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	.counter {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
	}

	button {
		cursor: pointer;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
	}

	button:hover {
		background: #f0f0f0;
	}
</style>
