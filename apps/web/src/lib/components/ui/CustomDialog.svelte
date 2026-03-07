<!--
  CustomDialog - Általános célú dialog komponens egyedi tartalommal és gombokkal.

  Props:
  - open: Dialog nyitott állapota (bindable)
  - title: Dialog címe
  - description: Opcionális leírás
  - content: Snippet a dialog tartalmához
  - actions: Snippet a funkciógombokhoz
  - onClose: Bezárás callback
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	interface Props {
		/** Dialog nyitott állapota */
		open: boolean;
		/** Dialog címe */
		title: string;
		/** Opcionális leírás a cím alatt */
		description?: string;
		/** Egyedi tartalom snippet */
		content: Snippet;
		/** Egyedi funkciógombok snippet */
		actions: Snippet;
		/** Bezárás callback (amikor a dialog bezárul) */
		onClose?: () => void;
	}

	let { open = $bindable(), title, description, content, actions, onClose }: Props = $props();

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen && onClose) {
			onClose();
		}
	}
</script>

<AlertDialog.Root bind:open onOpenChange={handleOpenChange}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description>{description}</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>

		<div class="dialog-content">
			{@render content?.()}
		</div>

		<AlertDialog.Footer>
			{@render actions?.()}
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style>
	.dialog-content {
		padding: 1rem 0;
	}
</style>
