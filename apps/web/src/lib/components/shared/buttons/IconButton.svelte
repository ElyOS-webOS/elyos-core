<!-- IconButton.svelte -->
<script lang="ts">
	import { Button, type ButtonVariant } from '$lib/components/ui/button';
	import type { Snippet } from 'svelte';

	interface Props {
		text: string;
		icon: Snippet;
		variant?: ButtonVariant;
		onclick?: () => void;
	}

	let { text, icon, onclick, variant = 'default' }: Props = $props();
</script>

<Button {variant} size="sm" {onclick}>
	{@render icon()}{text}
</Button>
