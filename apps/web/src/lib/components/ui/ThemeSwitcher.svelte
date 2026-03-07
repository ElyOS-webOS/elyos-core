<script lang="ts">
	import { getThemeManager } from '$lib/stores';
	import { Sun } from 'lucide-svelte';
	import { Moon } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { browser } from '$app/environment';

	let theme = $state<ReturnType<typeof getThemeManager> | null>(null);

	$effect(() => {
		if (browser) {
			theme = getThemeManager();
		}
	});

	// SSR fallback és kliens oldali érték
	const isDark = $derived(theme?.isDark ?? false);

	async function toggleTheme() {
		if (theme) {
			await theme.setMode(isDark ? 'light' : 'dark');
		}
	}
</script>

{#if browser}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<label for="toggle" class="self-center">
					<div class={['toggle', isDark ? 'enabled' : 'disabled']}>
						<span class="hidden">
							{isDark ? 'Enable Light Mode' : 'Enable Dark Mode'}
						</span>
						<div class="icons">
							<Sun />
							<Moon />
						</div>
						<input
							id="toggle"
							name="toggle"
							type="checkbox"
							checked={!isDark}
							onclick={toggleTheme}
						/>
					</div>
				</label></Tooltip.Trigger
			>
			<Tooltip.Content>Váltás {isDark ? 'világos' : 'sötét'} módra</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}

<style>
	:root {
		--transition: 0.5s ease;
	}
	.toggle {
		position: relative;

		transition: background var(--transition);
		cursor: pointer;
		border-radius: 10px;
		background: var(--color-taskbar-background);
		padding: 1px;
		width: 42px;
		height: 20px;
	}

	.toggle::before {
		display: block;
		position: absolute;
		transform: translate(0);
		z-index: 2;
		transition:
			transform var(--transition),
			background var(--transition);
		border-radius: 11px;
		background: var(--color-foreground);
		aspect-ratio: 1;
		width: 18px;
		/* height: 41px; */
		content: '';
	}

	.toggle.enabled::before {
		transform: translateX(22px);
	}

	.toggle input {
		position: absolute;
		top: 0;
		opacity: 0;
	}

	.toggle .icons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0 5px;
		height: 100%;
	}

	:global(.toggle .icons svg) {
		z-index: 0;
		fill: var(--color-taskbar-background);
		aspect-ratio: 1;
		width: 12px;
	}
</style>
