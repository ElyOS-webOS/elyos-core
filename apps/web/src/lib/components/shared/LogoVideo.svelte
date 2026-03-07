<script lang="ts">
	import Logo from '$lib/assets/logo.mp4';
	interface Props {
		width: number;
	}

	let { width }: Props = $props();
</script>

<video src={Logo} style="width: {width}px;" autoplay muted playsinline class="object-contain"
></video>
