<script lang="ts">
	import type { Column } from '@tanstack/table-core';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import EyeOff from 'lucide-svelte/icons/eye-off';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { useI18n } from '$lib/i18n/hooks';

	interface Props {
		column: Column<any, unknown>;
		title: string;
		onSort?: (id: string, desc: boolean) => void;
	}

	let { column, title, onSort }: Props = $props();

	const { t } = useI18n();

	let currentSort = $derived(column.getIsSorted());

	function handleSort(desc: boolean) {
		onSort?.(column.id, desc);
	}
</script>

{#if column.getCanSort()}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="sm"
					class="data-[state=open]:bg-accent -ml-3 h-8 text-xs font-semibold"
				>
					{title}
					{#if currentSort === 'desc'}
						<ArrowDown class="ml-2 size-4" />
					{:else if currentSort === 'asc'}
						<ArrowUp class="ml-2 size-4" />
					{:else}
						<ArrowUpDown class="ml-2 size-4" />
					{/if}
				</Button>
			{/snippet}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="start" class="z-9999">
			<DropdownMenu.Item onclick={() => handleSort(false)}>
				<ArrowUp class="text-muted-foreground/70 mr-2 size-3.5" />
				{t('common.dataTable.sortAsc')}
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={() => handleSort(true)}>
				<ArrowDown class="text-muted-foreground/70 mr-2 size-3.5" />
				{t('common.dataTable.sortDesc')}
			</DropdownMenu.Item>
			{#if column.getCanHide()}
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
					<EyeOff class="text-muted-foreground/70 mr-2 size-3.5" />
					{t('common.dataTable.hide')}
				</DropdownMenu.Item>
			{/if}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	{title}
{/if}
