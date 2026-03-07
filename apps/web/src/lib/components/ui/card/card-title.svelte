<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	type $$Props = HTMLAttributes<HTMLHeadingElement> & {
		children?: Snippet;
	};

	let { class: className, children, ...restProps }: $$Props = $props();
</script>

<h3 class={cn('text-2xl leading-none font-semibold tracking-tight', className)} {...restProps}>
	{@render children?.()}
</h3>
