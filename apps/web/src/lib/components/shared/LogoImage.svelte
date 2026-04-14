<script lang="ts">
	import Logo from '$lib/assets/logo.webp?enhanced';
	interface Props {
		width: number;
	}

	let { width }: Props = $props();
</script>

<enhanced:img src={Logo} alt="" style="width: {width}px; height: auto;" />
