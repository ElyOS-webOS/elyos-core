<!--
  AiInputField.svelte — Input mező az AI fej bal oldalán.

  Széles input mező nyíl gombbal, csak akkor látható, ha a panel aktív.

  Requirements: Design document - Input Field section
-->
<script lang="ts">
	import MessageInputBar from './MessageInputBar.svelte';

	interface Props {
		isVisible: boolean;
		onSend: (text: string) => void;
		disabled: boolean;
	}

	let { isVisible, onSend, disabled }: Props = $props();
</script>

{#if isVisible}
	<div class="ai-input-field">
		<MessageInputBar {onSend} {disabled} maxLength={500} />
	</div>
{/if}

<style>
	.ai-input-field {
		position: fixed;
		right: 300px;
		bottom: 5.5rem;
		z-index: 9997;
		animation: input-slide-in 0.3s ease;
		width: 400px;
		max-width: calc(100vw - 320px);
	}

	@keyframes input-slide-in {
		from {
			transform: translateX(20px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
