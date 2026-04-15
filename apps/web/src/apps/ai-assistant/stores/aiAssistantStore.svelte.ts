/**
 * AI Assistant store — Svelte 5 runes alapú állapotkezelés
 */

import { getContext, setContext } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import type {
	AiAssistantConfig,
	ChatMessage,
	EmotionState,
	ResponseCacheEntry
} from '../types/index.js';

const AI_ASSISTANT_STORE_KEY = Symbol('aiAssistantStore');

/** Alapértelmezett konfiguráció */
const DEFAULT_CONFIG: AiAssistantConfig = {
	maxHistoryLength: 50,
	maxQuestionLength: 500,
	cacheTtlMs: 3_600_000 // 1 óra
};

/** Kulcsszó-alapú érzelem detektálás szótára */
const EMOTION_KEYWORDS: Record<EmotionState, string[]> = {
	happy: [
		'köszön',
		'remek',
		'kiváló',
		'nagyszerű',
		'örül',
		'siker',
		'gratulál',
		'bravo',
		'helyes',
		'tökéletes',
		'thank',
		'great',
		'excellent',
		'perfect',
		'awesome',
		'wonderful',
		'fantastic'
	],
	confused: [
		'nem értem',
		'nem tudom',
		'bizonytalan',
		'kérdéses',
		'homályos',
		'zavaros',
		'unclear',
		'confused',
		'uncertain',
		'not sure',
		"don't know",
		'hmm',
		'sajnos nem'
	],
	thinking: [
		'gondolkod',
		'elemz',
		'vizsgál',
		'feldolgoz',
		'számít',
		'kiszámít',
		'meghatároz',
		'analyzing',
		'processing',
		'calculating',
		'considering',
		'evaluating',
		'let me think',
		'hadd gondolj'
	],
	surprised: [
		'meglepő',
		'váratlan',
		'érdekes',
		'figyelemre méltó',
		'wow',
		'surprising',
		'unexpected',
		'interesting',
		'remarkable',
		'incredible',
		'amazing',
		'unbelievable'
	],
	neutral: []
};

/** Az érvényes EmotionState értékek halmaza */
const VALID_EMOTIONS = new SvelteSet<EmotionState>([
	'happy',
	'confused',
	'thinking',
	'neutral',
	'surprised'
]);

class AiAssistantStore {
	// --- Reaktív állapot ---
	isOpen = $state(false);
	currentEmotion = $state<EmotionState>('neutral');
	messages = $state<ChatMessage[]>([]);
	loading = $state(false);
	error = $state<string | null>(null);

	// --- Derived értékek ---
	readonly hasMessages = $derived(this.messages.length > 0);
	readonly canSend = $derived(!this.loading);

	// --- Privát mezők ---
	#cache = new SvelteMap<string, ResponseCacheEntry>();
	#config: AiAssistantConfig = { ...DEFAULT_CONFIG };

	// --- Panel vezérlés ---

	/** Megnyitja a chat panelt */
	open(): void {
		this.isOpen = true;
	}

	/** Bezárja a chat panelt */
	close(): void {
		this.isOpen = false;
	}

	/** Váltja a chat panel nyitott/zárt állapotát */
	toggle(): void {
		this.isOpen = !this.isOpen;
	}

	// --- Érzelem detektálás ---

	/**
	 * Kulcsszó-alapú érzelem detektálás a válasz szövegéből.
	 * Mindig érvényes EmotionState értéket ad vissza.
	 */
	detectEmotion(text: string): EmotionState {
		if (!text || text.trim().length === 0) {
			return 'neutral';
		}

		const lower = text.toLowerCase();

		for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS) as [
			EmotionState,
			string[]
		][]) {
			if (emotion === 'neutral') continue;
			if (keywords.some((kw) => lower.includes(kw))) {
				return emotion;
			}
		}

		return 'neutral';
	}

	// --- Cache kezelés ---

	/** Normalizálja a kérdést cache kulcshoz (trim + lowercase) */
	#normalizeQuestion(question: string): string {
		return question.trim().toLowerCase();
	}

	/** Visszaadja a cache-elt választ, ha érvényes (nem járt le) */
	getCachedResponse(question: string): string | null {
		const key = this.#normalizeQuestion(question);
		const entry = this.#cache.get(key);
		if (!entry) return null;

		const isExpired = Date.now() - entry.timestamp > entry.ttl;
		if (isExpired) {
			this.#cache.delete(key);
			return null;
		}

		return entry.answer;
	}

	/** Cache-eli a választ a konfigurált TTL-lel */
	setCachedResponse(question: string, answer: string): void {
		const key = this.#normalizeQuestion(question);
		this.#cache.set(key, {
			question: key,
			answer,
			timestamp: Date.now(),
			ttl: this.#config.cacheTtlMs
		});
	}

	// --- localStorage perzisztencia ---

	/** Betölti a conversation history-t localStorage-ból */
	loadFromStorage(): void {
		if (typeof localStorage === 'undefined') return;

		try {
			const raw = localStorage.getItem('elyos_ai_assistant_history');
			if (!raw) return;

			const parsed = JSON.parse(raw) as { messages: ChatMessage[]; lastUpdated: number };
			if (Array.isArray(parsed.messages)) {
				this.messages = parsed.messages.slice(-this.#config.maxHistoryLength);
			}
		} catch {
			// Graceful degradation: ha a localStorage nem olvasható, session-only history
		}
	}

	/** Elmenti a conversation history-t localStorage-ba */
	saveToStorage(): void {
		if (typeof localStorage === 'undefined') return;

		try {
			const toStore = {
				messages: this.messages.slice(-this.#config.maxHistoryLength),
				lastUpdated: Date.now()
			};
			localStorage.setItem('elyos_ai_assistant_history', JSON.stringify(toStore));
		} catch {
			// Graceful degradation: ha a localStorage nem írható, session-only history
		}
	}

	// --- Üzenet kezelés ---

	/** Törli az összes üzenetet és a localStorage-t */
	clearHistory(): void {
		this.messages = [];
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.removeItem('elyos_ai_assistant_history');
			} catch {
				// Graceful degradation
			}
		}
	}

	/**
	 * Üzenetet küld az AI asszisztensnek.
	 * Phase 1-ben placeholder — Phase 2-ban a valós API hívás kerül ide.
	 */
	async sendMessage(question: string): Promise<void> {
		const trimmed = question.trim();

		// Validáció
		if (!trimmed) return;
		if (trimmed.length > this.#config.maxQuestionLength) {
			this.error = `A kérdés túl hosszú (maximum ${this.#config.maxQuestionLength} karakter).`;
			return;
		}

		// User üzenet hozzáadása
		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'user',
			content: trimmed,
			timestamp: Date.now()
		};

		this.messages = [...this.messages, userMessage].slice(-this.#config.maxHistoryLength);
		this.error = null;
		this.loading = true;
		this.currentEmotion = 'thinking';

		try {
			// Cache ellenőrzés
			const cached = this.getCachedResponse(trimmed);
			if (cached) {
				this.#addAssistantMessage(cached);
				return;
			}

			// Phase 2-ban ide kerül a valós API hívás
			// Egyelőre placeholder válasz
			const placeholderAnswer =
				'Az AI integráció a Phase 2-ban kerül megvalósításra. Kérdésed rögzítve.';
			this.setCachedResponse(trimmed, placeholderAnswer);
			this.#addAssistantMessage(placeholderAnswer);
		} catch {
			this.error = 'Az AI asszisztens jelenleg nem elérhető. Kérjük, próbálja újra később.';
			this.currentEmotion = 'confused';
		} finally {
			this.loading = false;
			this.saveToStorage();
		}
	}

	/** Hozzáad egy assistant üzenetet és frissíti az érzelmi állapotot */
	#addAssistantMessage(content: string): void {
		const emotion = this.detectEmotion(content);
		const assistantMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'assistant',
			content,
			timestamp: Date.now(),
			emotionState: emotion
		};

		this.messages = [...this.messages, assistantMessage].slice(-this.#config.maxHistoryLength);
		this.currentEmotion = emotion;
	}
}

// --- Globális fallback példány ---
let globalAiAssistantStore: AiAssistantStore | null = null;

/** Létrehozza (vagy visszaadja a meglévő) AiAssistantStore példányt */
export function createAiAssistantStore(): AiAssistantStore {
	if (!globalAiAssistantStore) {
		globalAiAssistantStore = new AiAssistantStore();
	}
	return globalAiAssistantStore;
}

/** Beállítja az AiAssistantStore-t a Svelte context-ben (layout szinten hívandó) */
export function setAiAssistantStore(store: AiAssistantStore): void {
	globalAiAssistantStore = store;
	setContext(AI_ASSISTANT_STORE_KEY, store);
}

/** Visszaadja az AiAssistantStore-t — context-ből, vagy globális fallback-ből */
export function getAiAssistantStore(): AiAssistantStore {
	try {
		const contextStore = getContext<AiAssistantStore>(AI_ASSISTANT_STORE_KEY);
		if (contextStore) return contextStore;
	} catch {
		// Komponensen kívüli hívás esetén globális fallback
	}

	if (!globalAiAssistantStore) {
		globalAiAssistantStore = new AiAssistantStore();
	}
	return globalAiAssistantStore;
}

export { AiAssistantStore, VALID_EMOTIONS, EMOTION_KEYWORDS };
export type { EmotionState };
