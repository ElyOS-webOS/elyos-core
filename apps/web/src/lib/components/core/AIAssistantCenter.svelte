<script lang="ts">
	import { BotMessageSquare } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { I18nProvider } from '$lib/i18n/components';
	import AiFixedPanel from '$apps/ai-assistant/components/AiFixedPanel.svelte';
	import AiChatBubbles from '$apps/ai-assistant/components/AiChatBubbles.svelte';
	import AiInputField from '$apps/ai-assistant/components/AiInputField.svelte';
	import { useI18n } from '$lib/i18n/hooks';
	import { getAiAssistantStore } from '$apps/ai-assistant/stores/aiAssistantStore.svelte.js';
	import { getAvatarConfig } from '$apps/ai-assistant/avatar.remote';

	const { t } = useI18n();
	const aiStore = getAiAssistantStore();

	// Avatar konfiguráció betöltése onMount-ban
	onMount(async () => {
		console.log('[AIAssistantCenter] Avatar konfiguráció betöltése...');
		const result = await getAvatarConfig();
		console.log('[AIAssistantCenter] Avatar config result:', result);
		if (result.success && result.config) {
			const { avatarIdname, quality } = result.config;
			const modelUrl = `/api/ai-avatar/${avatarIdname}/${avatarIdname}_${quality}.glb`;
			console.log('[AIAssistantCenter] Beállított model URL:', modelUrl);
			aiStore.setAvatarModelUrl(modelUrl);
		} else {
			console.log('[AIAssistantCenter] Nincs mentett avatar konfiguráció');
		}
	});

	/** Toggle panel láthatóság */
	function handleToggle() {
		aiStore.toggle();
	}

	/** Üzenet küldése */
	async function handleSend(text: string) {
		await aiStore.sendMessage(text);
	}
</script>

<I18nProvider namespaces={['ai-assistant', 'common']}>
	<!-- Taskbar ikon -->
	<Tooltip.Provider>
		<Tooltip.Root ignoreNonKeyboardFocus>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						class="taskbar-function-icon"
						aria-label={t('ai-assistant.taskbar.label') ?? 'AI Asszisztens'}
						onclick={handleToggle}
					>
						<BotMessageSquare class="h-5 w-5" />
					</button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>{t('ai-assistant.taskbar.label') ?? 'AI Asszisztens'}</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>

	<!-- Fixed Panel (jobb alsó sarok) -->
	<AiFixedPanel isVisible={aiStore.isOpen} modelUrl={aiStore.avatarModelUrl} />

	<!-- Chat Bubbles (képernyő közepe) -->
	<AiChatBubbles
		messages={aiStore.messages}
		loading={aiStore.loading}
		isVisible={aiStore.showChatBubbles}
	/>

	<!-- Input Field (alul középen) -->
	<AiInputField
		isVisible={aiStore.showInputField}
		onSend={handleSend}
		disabled={!aiStore.canSend}
	/>
</I18nProvider>
