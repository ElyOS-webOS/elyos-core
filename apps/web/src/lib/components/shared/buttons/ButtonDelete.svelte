<!-- ButtonEdit.svelte -->
<script lang="ts">
	import IconButton from './IconButton.svelte';
	import { Trash2 } from 'lucide-svelte';

	interface Props {
		text: string;
		onclick?: () => void;
	}

	let { text, onclick }: Props = $props();
</script>

<IconButton {text} variant="destructive" {onclick}>
	{#snippet icon()}<Trash2 />{/snippet}
</IconButton>
