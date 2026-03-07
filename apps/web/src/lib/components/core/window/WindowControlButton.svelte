<!--
Ablakok jobb felső sarkábna megjelenő vezértló gombok.
Minimalizálás, maximalizálás, bezárás.
Ha tartozik súgó az adott alkalmazáshoz, akkor annak is gombja.
-->
<script lang="ts">
	import { X, Minus, Maximize, Minimize2, Link } from 'lucide-svelte';

	interface Props {
		controlType: 'minimize' | 'maximize' | 'restore' | 'close' | 'help' | 'link';
		onClick: (e: MouseEvent) => void;
	}

	let { controlType, onClick }: Props = $props();

	let Icon = $derived.by(() => {
		switch (controlType) {
			case 'minimize':
				return Minus;
			case 'maximize':
				return Maximize;
			case 'restore':
				return Minimize2;
			case 'close':
				return X;
			case 'link':
				return Link;
		}
	});
</script>

<button
	onclick={(e) => {
		e.stopPropagation();
		onClick(e);
	}}
	class="btn-window-control btn-window-{controlType} btn-click-effect"
	aria-label="{controlType} window"
>
	{#if controlType === 'help'}
		<span>?</span>
	{:else}
		<Icon />
	{/if}
</button>

<style>
	.btn-window-control {
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		border: 1px solid rgba(0, 0, 0, 1);
		border-radius: 50%;
		width: 18px;
		height: 18px;
		color: rgba(0, 0, 0, 0.5);
		& :global(svg) {
			width: 10px !important;
			height: 10px !important;
		}
	}

	.btn-window-help {
		--btn-color: 52 144 220; /*rgb(52, 144, 220)*/
		border-color: rgb(var(--btn-color) / 0.5);
		background: rgb(var(--btn-color));
		font-size: 0.7rem;
	}

	.btn-window-link {
		--btn-color: 154 189 189; /*rgb(154 189 189)*/
		border-color: rgb(var(--btn-color) / 0.5);
		background: rgb(var(--btn-color));
		font-size: 0.7rem;
	}

	.btn-window-minimize {
		--btn-color: 223 187 47; /*rgb(223, 187, 47)*/
		border-color: rgb(var(--btn-color) / 0.5);
		background: rgb(var(--btn-color));
	}

	.btn-window-maximize,
	.btn-window-restore {
		--btn-color: 74 201 52; /*rgb(74, 201, 52)*/
		border-color: rgb(var(--btn-color) / 0.5);
		background: rgb(var(--btn-color));
	}

	.btn-window-close {
		--btn-color: 255 94 86; /*rgb(255, 94, 86)*/
		border-color: rgb(var(--btn-color) / 0.5);
		background: rgb(var(--btn-color));
	}

	:global {
		.window:not(.active) {
			.btn-window-control {
				span,
				svg {
					opacity: 0;
				}
			}

			.btn-window-control:hover {
				span,
				svg {
					opacity: 1;
				}
			}
		}
	}
</style>
