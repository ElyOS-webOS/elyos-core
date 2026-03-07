<script lang="ts">
	import type { RawMenuItem } from '$lib/types/menu';
	import { AppLayout } from '$lib/components/shared';
	import { createAppShell } from '$lib/apps/appShell.svelte';
	import menuData from './menu.json';

	const shell = createAppShell({
		appName: 'users',
		menuData: menuData as RawMenuItem[]
	});
</script>

<AppLayout {shell} namespaces={['users']} maxWidthClass="w-full" sidebarWidth={260} searchable />
