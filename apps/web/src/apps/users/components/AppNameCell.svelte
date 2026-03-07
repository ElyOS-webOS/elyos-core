<script lang="ts">
	import UniversalIcon from '$lib/components/shared/UniversalIcon.svelte';
	import type { RoleAppRow, GroupAppRow } from '$lib/server/database/repositories';

	interface Props {
		app: RoleAppRow | GroupAppRow;
	}

	let { app }: Props = $props();

	const name = $derived.by(() => {
		const nameObj = app.name as any;
		return typeof nameObj === 'object' && nameObj !== null
			? nameObj.hu || nameObj.en || ''
			: String(nameObj);
	});
</script>

<div class="flex items-center gap-2">
	<UniversalIcon icon={app.icon} appName={app.appId} size={24} />
	<span class="font-medium">{name}</span>
</div>
