<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button';

	interface Props extends ButtonProps {
		text: string;
	}

	let { text, ...restProps }: Props = $props();
</script>

<Button variant="outline" size="sm" {...restProps}>
	{text}
</Button>
