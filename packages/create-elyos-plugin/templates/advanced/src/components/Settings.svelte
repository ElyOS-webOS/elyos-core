<script lang="ts">
	const sdk = window.webOS;

	let name = $state('');

	async function saveName() {
		if (!name.trim()) {
			sdk?.ui.toast('Name is required', 'warning');
			return;
		}
		await sdk?.data.set('user-name', name);
		sdk?.ui.toast('Name saved!', 'success');
	}

	async function loadName() {
		const stored = await sdk?.data.get<string>('user-name');
		if (stored) {
			name = stored;
		}
	}

	loadName();
</script>

<div>
	<h2>{sdk?.i18n.t('settings.title') ?? 'Settings'}</h2>

	<label>
		{sdk?.i18n.t('settings.name') ?? 'Your name'}
		<input type="text" bind:value={name} placeholder="Enter your name" />
	</label>

	<button onclick={saveName}>
		{sdk?.i18n.t('settings.save') ?? 'Save'}
	</button>
</div>

<style>
	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input {
		display: block;
		margin-top: 0.25rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.5rem;
		width: 100%;
		max-width: 300px;
	}

	button {
		cursor: pointer;
		margin-top: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		padding: 0.5rem 1rem;
	}
</style>
