<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import CirclePlus from 'lucide-svelte/icons/circle-plus';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator';
	import { useI18n } from '$lib/i18n/hooks';

	interface FilterOption {
		value: string;
		label: string;
	}

	interface Props {
		title: string;
		options: FilterOption[];
		selectedValues: string[];
		onValuesChange: (values: string[]) => void;
	}

	let { title, options, selectedValues, onValuesChange }: Props = $props();

	const { t } = useI18n();

	let open = $state(false);

	function toggleValue(value: string) {
		if (selectedValues.includes(value)) {
			onValuesChange(selectedValues.filter((v) => v !== value));
		} else {
			onValuesChange([...selectedValues, value]);
		}
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="h-8 border-dashed">
				<CirclePlus class="mr-2 size-4" />
				{title}
				{#if selectedValues.length > 0}
					<Separator orientation="vertical" class="mx-2 h-4" />
					<div class="flex gap-1">
						{#if selectedValues.length > 2}
							<div
								class="bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-xs font-medium"
							>
								{selectedValues.length}
								{t('common.dataTable.selected')}
							</div>
						{:else}
							{#each selectedValues as val}
								<div
									class="bg-primary text-primary-foreground rounded px-1.5 py-0.5 text-xs font-medium"
								>
									{options.find((o) => o.value === val)?.label ?? val}
								</div>
							{/each}
						{/if}
					</div>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="z-9999 w-[200px] p-0" align="start">
		<div class="p-1">
			{#each options as option (option.value)}
				<button
					class="hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm"
					onclick={() => toggleValue(option.value)}
				>
					<div
						class="border-primary mr-2 flex size-4 items-center justify-center rounded-sm border"
						class:bg-primary={selectedValues.includes(option.value)}
						class:text-primary-foreground={selectedValues.includes(option.value)}
					>
						{#if selectedValues.includes(option.value)}
							<Check class="size-3" />
						{/if}
					</div>
					<span>{option.label}</span>
				</button>
			{/each}
			{#if selectedValues.length > 0}
				<Separator class="my-1" />
				<button
					class="hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-sm"
					onclick={() => {
						onValuesChange([]);
						open = false;
					}}
				>
					{t('common.dataTable.clearFilters')}
				</button>
			{/if}
		</div>
	</Popover.Content>
</Popover.Root>
