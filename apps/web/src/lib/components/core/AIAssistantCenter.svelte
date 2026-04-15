<script lang="ts">
	import { Bot } from 'lucide-svelte';
	import * as Popover from '$lib/components/ui/popover';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { getAiAssistantStore } from '$apps/ai-assistant/stores/aiAssistantStore.svelte';
	import AiChatPanel from '$apps/ai-assistant/components/AiChatPanel.svelte';
	import { useI18n } from '$lib/i18n/hooks';

	const { t } = useI18n();
	const aiStore = getAiAssistantStore();

	let isOpen = $state(false);
</script>

<Tooltip.Provider>
	<Popover.Root bind:open={isOpen}>
		<Tooltip.Root ignoreNonKeyboardFocus>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Popover.Trigger
						{...props}
						class="taskbar-function-icon"
						aria-label={t('ai-assistant.taskbar.label') ?? 'AI Asszisztens'}
					>
						<Bot class="h-5 w-5" />
					</Popover.Trigger>
				{/snippet}
			</Tooltip.Trigger>
			<Popover.Content class="z-1000 w-[380px] p-0" align="end" sideOffset={8}>
				<AiChatPanel />
			</Popover.Content>
			<Tooltip.Content class="z-1001">
				{t('ai-assistant.taskbar.tooltip') ?? 'AI Asszisztens'}
			</Tooltip.Content>
		</Tooltip.Root>
	</Popover.Root>
</Tooltip.Provider>
