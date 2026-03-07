<script lang="ts">
	interface Props {
		message: string;
	}

	let { message }: Props = $props();
</script>

<div class="error-alert">
	<div class="error-icon">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
	</div>
	<p class="error-message">{message}</p>
</div>

<style>
	.error-alert {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
	}

	.error-icon {
		width: 3rem;
		height: 3rem;
		color: #ef4444;
	}

	.error-icon svg {
		width: 100%;
		height: 100%;
	}

	.error-message {
		margin: 0;
		color: #dc2626;
		font-weight: 500;
		font-size: 0.7rem;
		text-align: center;
	}
</style>
