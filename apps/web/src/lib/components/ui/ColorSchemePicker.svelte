<script lang="ts">
	import { getThemeManager } from '$lib/stores';
	import { browser } from '$app/environment';

	let theme = $state<ReturnType<typeof getThemeManager> | null>(null);

	$effect(() => {
		if (browser) {
			theme = getThemeManager();
		}
	});

	const schemes: { label: string; color: string }[] = [
		{ label: 'Kék', color: '225' },
		{ label: 'Zöld', color: '185' },
		{ label: 'Lila', color: '290' },
		{ label: 'Narancs', color: '45' },
		{ label: 'Piros', color: '30' }
	];

	async function handleColorChange(color: string) {
		if (theme) {
			await theme.setColor(color);
		}
	}
</script>

{#if browser && theme}
	<div class="color-scheme-picker">
		{#each schemes as scheme}
			<button
				class="scheme-btn"
				class:active={theme.settings.colorPrimaryHue === scheme.color}
				onclick={() => handleColorChange(scheme.color)}
				title={scheme.label}
				style="--scheme-color: oklch(56% var(--primary-c) {scheme.color})"
			>
				<span class="color-dot"></span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.color-scheme-picker {
		display: flex;
		gap: 8px;
		border-radius: 8px;
		background: rgba(0, 0, 0, 0.05);
		padding: 4px;
	}

	.scheme-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 2px solid transparent;
		border-radius: 6px;
		background: transparent;
		padding: 0;
		width: 32px;
		height: 32px;
	}

	.scheme-btn:hover {
		transform: scale(1.1);
		border-color: var(--scheme-color);
		background: rgba(0, 0, 0, 0.05);
	}

	.scheme-btn.active {
		border-color: var(--scheme-color);
		background: var(--scheme-color);
	}

	.color-dot {
		transition: all 0.2s ease;
		border-radius: 50%;
		background: var(--scheme-color);
		width: 20px;
		height: 20px;
	}

	.scheme-btn.active .color-dot {
		background: white;
	}

	/* Dark mode */
	:global(#desktop.dark) .color-scheme-picker {
		background: rgba(255, 255, 255, 0.05);
	}

	:global(#desktop.dark) .scheme-btn:hover {
		background: rgba(255, 255, 255, 0.1);
	}
</style>
