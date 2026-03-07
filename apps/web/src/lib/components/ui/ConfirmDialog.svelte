<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	interface Props {
		/** Dialog nyitott állapota */
		open: boolean;
		/** Cím */
		title: string;
		/** Leírás/kérdés */
		description: string;
		/** Megerősítő gomb szövege */
		confirmText?: string;
		/** Mégse gomb szövege */
		cancelText?: string;
		/** Megerősítő gomb variánsa (destructive törlésnél) */
		confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		/** Megerősítés callback */
		onConfirm: () => void;
		/** Mégse/bezárás callback */
		onCancel: () => void;
	}

	let {
		open = $bindable(),
		title,
		description,
		confirmText = 'Continue',
		cancelText = 'Cancel',
		confirmVariant = 'default',
		onConfirm,
		onCancel
	}: Props = $props();

	function handleConfirm() {
		open = false;
		onConfirm();
	}

	function handleCancel() {
		open = false;
		onCancel();
	}
</script>

<AlertDialog.Root bind:open onOpenChange={(isOpen) => !isOpen && onCancel()}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			<AlertDialog.Description>{description}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={handleCancel}>{cancelText}</AlertDialog.Cancel>
			<AlertDialog.Action
				class={buttonVariants({ variant: confirmVariant })}
				onclick={handleConfirm}
			>
				{confirmText}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
