<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		title: string;
		description?: string;
		info?: Snippet;
		disabled?: boolean;
		contentPosition?: 'bottom' | 'right';
		children?: Snippet;
	}

	let {
		title,
		description,
		info,
		disabled = false,
		contentPosition = 'right',
		children
	}: Props = $props();
</script>

<section>
	<div class="item">
		<div class={['header', contentPosition === 'bottom' && 'flex-col items-start!']}>
			<div class="label-group" class:disabled>
				<Label>{title}</Label>
				{#if description}
					<p class="description">{description}</p>
				{/if}
			</div>

			{@render children?.()}
		</div>
		{#if info}
			<div class="info-block" class:disabled>
				{@render info()}
			</div>
		{/if}
	</div>
</section>

<style>
	.item :global {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 1.5rem;
		}

		.label-group {
			display: flex;
			flex: 1;
			flex-direction: column;
			gap: 0.375rem;
		}

		.label-group.disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}

		.info-block {
			border: 1px solid var(--color-neutral-200);
			border-radius: var(--radius-md, 0.375rem);
			background-color: var(--color-neutral-50);
			padding: 0.875rem 1rem;
			color: var(--color-neutral-600);
			font-size: 0.75rem;
			line-height: 1.6;
		}

		.info-block.disabled {
			opacity: 0.6;
			border-color: var(--color-neutral-200);
			background-color: var(--color-neutral-50);
			color: var(--color-neutral-400);
		}

		.info-block p {
			margin: 0;
		}
	}

	.label-group :global(label) {
		color: var(--color-neutral-900);
		font-weight: 600;
		font-size: 1.0625rem;
		letter-spacing: -0.01em;
	}

	:global(.dark) .label-group :global(label) {
		color: var(--color-neutral-300);
	}

	.description {
		margin: 0;
		color: var(--color-neutral-500);
		font-weight: 400;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	:global(.dark) .description {
		color: var(--color-neutral-500);
	}

	:global(.dark) .info-block {
		border-color: var(--color-neutral-800);
		background-color: var(--color-neutral-900);
		color: var(--color-neutral-400);
	}

	:global(.dark) .item :global(.info-block.disabled) {
		border-color: var(--color-neutral-800);
		background-color: var(--color-neutral-900);
		color: var(--color-neutral-600);
	}
</style>
