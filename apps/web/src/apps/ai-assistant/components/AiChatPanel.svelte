<!--
  AiChatPanel.svelte — Az AI asszisztens fő panel komponense.

  Layout:
  - AiAvatarCanvas (felül, 3D animált avatar)
  - Érzelem-választó lista (demo/tesztelési célra)
  - Üzenet előzmények
  - MessageInputBar (alul)

  Requirements: 2.1, 2.2, 2.5, 2.6, 10.1, 10.2, 13.4, 13.5, 13.6
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { mode } from 'mode-watcher';
	import { Bot, Trash2 } from 'lucide-svelte';
	import { useI18n } from '$lib/i18n/hooks';
	import { getAiAssistantStore } from '../stores/aiAssistantStore.svelte.js';
	import AiAvatarCanvas from './AiAvatarCanvas.svelte';
	import MessageInputBar from './MessageInputBar.svelte';
	import type { EmotionState } from '../types/index.js';

	const { t } = useI18n();
	const aiStore = getAiAssistantStore();

	/** Aktuális téma a mode-watcher alapján */
	const theme = $derived<'light' | 'dark'>(mode.current === 'dark' ? 'dark' : 'light');

	/** Az 5 érzelem-állapot a választóhoz */
	const EMOTIONS: { value: EmotionState; label: string; emoji: string }[] = [
		{ value: 'neutral', label: 'Semleges', emoji: '😐' },
		{ value: 'happy', label: 'Boldog', emoji: '😊' },
		{ value: 'thinking', label: 'Gondolkodó', emoji: '🤔' },
		{ value: 'confused', label: 'Tanácstalan', emoji: '😕' },
		{ value: 'surprised', label: 'Meglepett', emoji: '😮' }
	];

	let messagesEndRef: HTMLDivElement | undefined = $state();
	let panelRef: HTMLDivElement | undefined = $state();

	/** Görgetés az utolsó üzenethez */
	function scrollToBottom() {
		messagesEndRef?.scrollIntoView({ behavior: 'smooth' });
	}

	/** Escape billentyű bezárja a panelt (Requirements: 2.5) */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			aiStore.close();
		}
	}

	/** Érzelem kiválasztása a listából */
	function selectEmotion(emotion: EmotionState) {
		aiStore.currentEmotion = emotion;
	}

	/** Üzenet küldése */
	async function handleSend(text: string) {
		await aiStore.sendMessage(text);
	}

	/** History törlése */
	function handleClearHistory() {
		aiStore.clearHistory();
	}

	/** Időbélyeg formázása */
	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('hu-HU', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Görgetés új üzenet esetén
	$effect(() => {
		if (aiStore.messages.length > 0) {
			scrollToBottom();
		}
	});

	// localStorage betöltése megnyitáskor
	onMount(() => {
		aiStore.loadFromStorage();
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={panelRef}
	role="dialog"
	tabindex="-1"
	aria-label={t('ai-assistant.panel.title') ?? 'AI Asszisztens'}
	aria-modal="false"
	onkeydown={handleKeydown}
	class="flex h-[520px] flex-col"
>
	<!-- Fejléc -->
	<div class="flex items-center justify-between border-b px-4 py-2.5">
		<div class="flex items-center gap-2">
			<Bot class="text-primary h-4 w-4" />
			<span class="text-sm font-semibold">
				{t('ai-assistant.panel.title') ?? 'AI Asszisztens'}
			</span>
		</div>
		{#if aiStore.hasMessages}
			<button
				onclick={handleClearHistory}
				aria-label={t('ai-assistant.history.clear') ?? 'Előzmények törlése'}
				title={t('ai-assistant.history.clear') ?? 'Előzmények törlése'}
				class="text-muted-foreground hover:text-destructive rounded-md p-1 transition-colors"
			>
				<Trash2 class="h-4 w-4" />
			</button>
		{/if}
	</div>

	<!-- Avatar + érzelem-választó -->
	<div class="flex flex-col items-center gap-3 border-b px-4 py-3">
		<!-- 3D Avatar (Requirements: 2.1, 13.1) -->
		<div class="h-60 w-60 shrink-0">
			<AiAvatarCanvas emotionState={aiStore.currentEmotion} {theme} {panelRef} />
		</div>

		<!-- Érzelem-választó lista (Requirements: 13.4, 13.5, 13.6) -->
		<div class="flex w-full flex-col gap-1.5">
			<span class="text-muted-foreground text-xs font-medium">
				{t('ai-assistant.emotion.label') ?? 'Hangulat'}
			</span>
			<div
				class="flex flex-wrap justify-center gap-1"
				role="group"
				aria-label={t('ai-assistant.emotion.label') ?? 'Érzelem választó'}
			>
				{#each EMOTIONS as emotion (emotion.value)}
					<button
						onclick={() => selectEmotion(emotion.value)}
						aria-pressed={aiStore.currentEmotion === emotion.value}
						aria-label={emotion.label}
						title={emotion.label}
						class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors
							{aiStore.currentEmotion === emotion.value
							? 'bg-primary text-primary-foreground'
							: 'bg-muted text-muted-foreground hover:bg-muted/80'}"
					>
						<span aria-hidden="true">{emotion.emoji}</span>
						<span>{emotion.label}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Üzenet előzmények (Requirements: 2.3, 2.6) -->
	<div
		class="flex-1 overflow-y-auto px-4 py-3"
		role="log"
		aria-label={t('ai-assistant.history.label') ?? 'Beszélgetési előzmények'}
		aria-live="polite"
		aria-relevant="additions"
	>
		{#if !aiStore.hasMessages}
			<div
				class="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-center"
			>
				<Bot class="h-10 w-10 opacity-20" />
				<p class="text-sm">
					{t('ai-assistant.history.empty') ?? 'Tedd fel az első kérdésedet!'}
				</p>
			</div>
		{:else}
			<div class="flex flex-col gap-3">
				{#each aiStore.messages as message (message.id)}
					{#if message.role === 'user'}
						<!-- Felhasználói üzenet -->
						<div class="flex justify-end">
							<div class="max-w-[80%]">
								<div
									class="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-3 py-2 text-sm"
								>
									{message.content}
								</div>
								<p class="text-muted-foreground mt-0.5 text-right text-xs">
									{formatTime(message.timestamp)}
								</p>
							</div>
						</div>
					{:else}
						<!-- Asszisztens üzenet -->
						<div class="flex justify-start">
							<div class="max-w-[80%]">
								<div class="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 text-sm">
									{message.content}
								</div>
								<p class="text-muted-foreground mt-0.5 text-xs">
									{formatTime(message.timestamp)}
								</p>
							</div>
						</div>
					{/if}
				{/each}

				<!-- Loading indikátor (Requirements: 2.7) -->
				{#if aiStore.loading}
					<div
						class="flex justify-start"
						aria-label={t('ai-assistant.loading') ?? 'Válasz betöltése...'}
					>
						<div class="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
							<div class="flex gap-1" aria-hidden="true">
								<span
									class="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:0ms]"
								></span>
								<span
									class="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:150ms]"
								></span>
								<span
									class="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:300ms]"
								></span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Görgetési referencia pont -->
		<div bind:this={messagesEndRef}></div>
	</div>

	<!-- Hibaüzenet -->
	{#if aiStore.error}
		<div
			class="bg-destructive/10 text-destructive mx-4 mb-2 rounded-md px-3 py-2 text-xs"
			role="alert"
			aria-live="assertive"
		>
			{aiStore.error}
		</div>
	{/if}

	<!-- Üzenet beviteli sáv (Requirements: 2.2, 2.4, 2.5) -->
	<MessageInputBar onSend={handleSend} disabled={!aiStore.canSend} maxLength={500} />
</div>
