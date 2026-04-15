<!--
  MessageInputBar.svelte — Üzenet beviteli sáv az AI asszisztenshez.

  Tartalmaz:
  - Szövegbeviteli mezőt (max 500 karakter) inline validációval
  - Send gombot
  - TTS placeholder gombot (disabled — jövőbeli funkció)
  - Enter billentyűre küldés
  - Inline validáció a hosszra

  Requirements: 2.2, 2.4, 2.5, 8.3, 12.1
-->
<script lang="ts">
	import { Send, Volume2 } from 'lucide-svelte';
	import { useI18n } from '$lib/i18n/hooks';

	const { t } = useI18n();

	interface Props {
		/** Küldés callback — meghívódik érvényes üzenet esetén */
		onSend: (text: string) => void;
		/** Ha true, a beviteli mező és a send gomb le van tiltva */
		disabled?: boolean;
		/** Maximális karakter szám (alapértelmezett: 500) */
		maxLength?: number;
	}

	let { onSend, disabled = false, maxLength = 500 }: Props = $props();

	let inputValue = $state('');
	let validationError = $state<string | null>(null);

	/** Az aktuális karakter szám */
	const charCount = $derived(inputValue.length);
	/** Igaz, ha a szöveg meghaladja a maximumot */
	const isTooLong = $derived(charCount > maxLength);
	/** Igaz, ha a szöveg üres vagy csak whitespace */
	const isEmpty = $derived(inputValue.trim().length === 0);
	/** A send gomb aktív-e */
	const canSubmit = $derived(!disabled && !isEmpty && !isTooLong);

	/** Validálja a bevitelt és frissíti a hibaüzenetet */
	function validate(): boolean {
		if (isEmpty) {
			validationError = null;
			return false;
		}
		if (isTooLong) {
			validationError =
				t('ai-assistant.input.tooLong', { max: String(maxLength) }) ??
				`A kérdés túl hosszú (maximum ${maxLength} karakter).`;
			return false;
		}
		validationError = null;
		return true;
	}

	/** Elküldi az üzenetet, ha érvényes */
	function handleSend() {
		if (!validate()) return;
		const text = inputValue.trim();
		onSend(text);
		inputValue = '';
		validationError = null;
	}

	/** Enter billentyű kezelése (Shift+Enter = sortörés, Enter = küldés) */
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	/** Input változáskor validálás */
	function handleInput() {
		if (isTooLong) {
			validationError =
				t('ai-assistant.input.tooLong', { max: String(maxLength) }) ??
				`A kérdés túl hosszú (maximum ${maxLength} karakter).`;
		} else {
			validationError = null;
		}
	}
</script>

<div class="border-t p-3">
	<!-- Validációs hibaüzenet -->
	{#if validationError}
		<p class="text-destructive mb-2 text-xs" role="alert" aria-live="polite">
			{validationError}
		</p>
	{/if}

	<div class="flex items-end gap-2">
		<!-- Szövegbeviteli mező -->
		<div class="relative flex-1">
			<textarea
				bind:value={inputValue}
				onkeydown={handleKeydown}
				oninput={handleInput}
				{disabled}
				rows={2}
				class="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50
					{isTooLong ? 'border-destructive focus-visible:ring-destructive' : ''}"
				placeholder={t('ai-assistant.input.placeholder') ?? 'Kérdezz valamit...'}
				aria-label={t('ai-assistant.input.label') ?? 'Kérdés beviteli mező'}
				aria-describedby={validationError ? 'input-error' : 'char-count'}
				aria-invalid={isTooLong}
			></textarea>

			<!-- Karakter számláló -->
			<span
				id="char-count"
				class="text-muted-foreground absolute right-2 bottom-1.5 text-xs
					{isTooLong ? 'text-destructive' : ''}"
				aria-live="polite"
			>
				{charCount}/{maxLength}
			</span>
		</div>

		<!-- Gombok oszlopa -->
		<div class="flex flex-col gap-1.5 pb-0.5">
			<!-- TTS placeholder gomb (disabled — jövőbeli funkció, Requirements: 12.1) -->
			<button
				disabled
				title={t('ai-assistant.tts.comingSoon') ?? 'Szövegfelolvasás (hamarosan)'}
				aria-label={t('ai-assistant.tts.comingSoon') ?? 'Szövegfelolvasás (hamarosan)'}
				class="text-muted-foreground flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-md opacity-40"
			>
				<Volume2 class="h-4 w-4" />
			</button>

			<!-- Send gomb -->
			<button
				onclick={handleSend}
				disabled={!canSubmit}
				aria-label={t('ai-assistant.input.send') ?? 'Küldés'}
				class="bg-primary text-primary-foreground hover:bg-primary/90 flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-50"
			>
				<Send class="h-4 w-4" />
			</button>
		</div>
	</div>
</div>
