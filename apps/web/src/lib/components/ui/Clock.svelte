<script lang="ts">
	let time = $state(new Date());

	$effect(() => {
		const interval = setInterval(() => {
			time = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<div class="clock">
	{time.toLocaleTimeString()}
</div>

<style>
	.clock {
		display: flex;
		align-items: center;
		color: var(--panel-text-color);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
</style>
