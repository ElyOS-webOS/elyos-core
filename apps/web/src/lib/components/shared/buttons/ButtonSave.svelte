<!-- ButtonEdit.svelte -->
<script lang="ts">
	import IconButton from './IconButton.svelte';
	import { Save } from 'lucide-svelte';

	interface Props {
		text: string;
		onclick?: () => void;
	}

	let { text, onclick }: Props = $props();
</script>

<IconButton {text} {onclick}>
	{#snippet icon()}<Save />{/snippet}
</IconButton>
