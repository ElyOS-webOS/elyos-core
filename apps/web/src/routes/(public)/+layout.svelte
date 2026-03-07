<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './appPublic.css';
	let { children, data } = $props();
</script>

<h1>Public layout</h1>
{@render children()}
