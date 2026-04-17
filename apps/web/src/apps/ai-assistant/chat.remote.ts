/**
 * AI Chat Remote Actions
 *
 * AI Agent chat funkció - server-side actions.
 *
 * A rendszer automatikusan beállítja az AI válaszok nyelvét a felhasználó
 * WebOS nyelvi beállítása alapján (locals.locale).
 */

import { command, query, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import {
	agentConfigRepository,
	avatarRepository,
	aiProviderRepository
} from '$lib/server/database/repositories';

// ============================================================================
// Helper funkciók
// ============================================================================

/**
 * Provider konfiguráció lekérése adatbázisból environment változó fallback-kel
 */
async function getProviderConfigValue(
	providerName: string,
	configKey: string,
	envKey?: string
): Promise<string | null> {
	try {
		const configMap = await aiProviderRepository.getProviderConfigMap(providerName);
		const dbValue = configMap[configKey];

		// Precedencia: adatbázis érték → environment változó → null
		if (dbValue) {
			return dbValue;
		}

		if (envKey && process.env[envKey]) {
			return process.env[envKey] || null;
		}

		return null;
	} catch (err) {
		console.error(`[AiChat] Provider config lekérési hiba (${providerName}.${configKey}):`, err);
		// Ha adatbázis hiba van, próbáljuk az environment változót
		if (envKey && process.env[envKey]) {
			return process.env[envKey] || null;
		}
		return null;
	}
}

// ============================================================================
// Sémák
// ============================================================================

/** sendChatMessage: üzenet küldése az AI agentnek */
const sendChatMessageSchema = v.object({
	message: v.pipe(v.string(), v.minLength(1), v.maxLength(500)),
	conversationHistory: v.optional(
		v.array(
			v.object({
				role: v.union([v.literal('user'), v.literal('assistant')]),
				content: v.string()
			})
		)
	)
});

// ============================================================================
// Válasz típusok
// ============================================================================

export interface SendChatMessageResult {
	success: boolean;
	error?: string;
	response?: string;
}

export interface GetWelcomeMessageResult {
	success: boolean;
	error?: string;
	message?: string;
}

// ============================================================================
// sendChatMessage — üzenet küldése az AI agentnek
// ============================================================================

export const sendChatMessage = command(
	sendChatMessageSchema,
	async (data): Promise<SendChatMessageResult> => {
		const event = getRequestEvent();
		const { locals } = event;

		if (!locals.user?.id) {
			return { success: false, error: 'Nem vagy bejelentkezve.' };
		}

		try {
			const userId = parseInt(locals.user.id);

			// Betöltjük az aktív agent konfigurációt
			const config = await agentConfigRepository.getActiveAgentConfigWithKey(userId);
			if (!config) {
				return {
					success: false,
					error:
						'Nincs beállított AI agent konfiguráció. Kérlek, állítsd be először a beállításokban.'
				};
			}

			const { provider, apiKey, modelName, baseUrl } = config;

			// Nyelvi beállítás meghatározása
			const userLocale = locals.locale || 'hu';
			const languageInstruction =
				userLocale === 'hu' ? 'Válaszolj magyarul.' : 'Please respond in English.';

			// Provider-specifikus API hívás
			switch (provider) {
				case 'gemini': {
					const url =
						baseUrl ||
						(await getProviderConfigValue('gemini', 'base_url')) ||
						'https://generativelanguage.googleapis.com/v1beta/models';
					const model =
						modelName ||
						(await getProviderConfigValue('gemini', 'default_model', 'AI_GEMINI_DEFAULT_MODEL')) ||
						'gemini-2.5-flash';
					const apiUrl = `${url}/${model}:generateContent?key=${apiKey}`;

					// Conversation history formázása Gemini formátumra
					const contents = [];

					// System message hozzáadása a nyelvi beállítással
					contents.push({
						role: 'user',
						parts: [{ text: languageInstruction }]
					});
					contents.push({
						role: 'model',
						parts: [{ text: 'Understood.' }]
					});

					if (data.conversationHistory && data.conversationHistory.length > 0) {
						for (const msg of data.conversationHistory) {
							contents.push({
								role: msg.role === 'assistant' ? 'model' : 'user',
								parts: [{ text: msg.content }]
							});
						}
					}
					// Aktuális üzenet hozzáadása
					contents.push({
						role: 'user',
						parts: [{ text: data.message }]
					});

					const response = await fetch(apiUrl, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ contents })
					});

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						return {
							success: false,
							error: `Gemini API hiba: ${errorData.error?.message || response.statusText}`
						};
					}

					const result = await response.json();
					const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

					if (!text) {
						return {
							success: false,
							error: 'Nem érkezett válasz az AI-tól.'
						};
					}

					return {
						success: true,
						response: text
					};
				}

				case 'groq': {
					const url =
						baseUrl ||
						(await getProviderConfigValue('groq', 'base_url')) ||
						'https://api.groq.com/openai/v1/chat/completions';
					const model =
						modelName ||
						(await getProviderConfigValue('groq', 'default_model', 'AI_GROQ_DEFAULT_MODEL')) ||
						'llama-3.3-70b-versatile';

					// Conversation history formázása OpenAI formátumra
					const messages = [];

					// System message hozzáadása a nyelvi beállítással
					messages.push({
						role: 'system',
						content: languageInstruction
					});

					if (data.conversationHistory && data.conversationHistory.length > 0) {
						for (const msg of data.conversationHistory) {
							messages.push({
								role: msg.role,
								content: msg.content
							});
						}
					}
					// Aktuális üzenet hozzáadása
					messages.push({
						role: 'user',
						content: data.message
					});

					const response = await fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${apiKey}`
						},
						body: JSON.stringify({
							model,
							messages
						})
					});

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						return {
							success: false,
							error: `Groq API hiba: ${errorData.error?.message || response.statusText}`
						};
					}

					const result = await response.json();
					const text = result.choices?.[0]?.message?.content;

					if (!text) {
						return {
							success: false,
							error: 'Nem érkezett válasz az AI-tól.'
						};
					}

					return {
						success: true,
						response: text
					};
				}

				case 'openai': {
					const url =
						baseUrl ||
						(await getProviderConfigValue('openai', 'base_url')) ||
						'https://api.openai.com/v1/chat/completions';
					const model =
						modelName ||
						(await getProviderConfigValue('openai', 'default_model', 'AI_OPENAI_DEFAULT_MODEL')) ||
						'gpt-4o-mini';

					// Conversation history formázása OpenAI formátumra
					const messages = [];

					// System message hozzáadása a nyelvi beállítással
					messages.push({
						role: 'system',
						content: languageInstruction
					});

					if (data.conversationHistory && data.conversationHistory.length > 0) {
						for (const msg of data.conversationHistory) {
							messages.push({
								role: msg.role,
								content: msg.content
							});
						}
					}
					// Aktuális üzenet hozzáadása
					messages.push({
						role: 'user',
						content: data.message
					});

					const response = await fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${apiKey}`
						},
						body: JSON.stringify({
							model,
							messages
						})
					});

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						return {
							success: false,
							error: `OpenAI API hiba: ${errorData.error?.message || response.statusText}`
						};
					}

					const result = await response.json();
					const text = result.choices?.[0]?.message?.content;

					if (!text) {
						return {
							success: false,
							error: 'Nem érkezett válasz az AI-tól.'
						};
					}

					return {
						success: true,
						response: text
					};
				}

				case 'anthropic': {
					const url =
						baseUrl ||
						(await getProviderConfigValue('anthropic', 'base_url')) ||
						'https://api.anthropic.com/v1/messages';
					const model =
						modelName ||
						(await getProviderConfigValue(
							'anthropic',
							'default_model',
							'AI_ANTHROPIC_DEFAULT_MODEL'
						)) ||
						'claude-3-5-sonnet-20241022';

					// Conversation history formázása Anthropic formátumra
					const messages = [];

					// System message hozzáadása a nyelvi beállítással
					messages.push({
						role: 'user',
						content: languageInstruction
					});
					messages.push({
						role: 'assistant',
						content: 'Understood.'
					});

					if (data.conversationHistory && data.conversationHistory.length > 0) {
						for (const msg of data.conversationHistory) {
							messages.push({
								role: msg.role,
								content: msg.content
							});
						}
					}
					// Aktuális üzenet hozzáadása
					messages.push({
						role: 'user',
						content: data.message
					});

					const response = await fetch(url, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': apiKey,
							'anthropic-version': '2023-06-01'
						},
						body: JSON.stringify({
							model,
							messages,
							max_tokens: 1024
						})
					});

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						return {
							success: false,
							error: `Anthropic API hiba: ${errorData.error?.message || response.statusText}`
						};
					}

					const result = await response.json();
					const text = result.content?.[0]?.text;

					if (!text) {
						return {
							success: false,
							error: 'Nem érkezett válasz az AI-tól.'
						};
					}

					return {
						success: true,
						response: text
					};
				}

				case 'huggingface': {
					const url =
						baseUrl ||
						(await getProviderConfigValue('huggingface', 'base_url')) ||
						'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
					const model =
						modelName ||
						(await getProviderConfigValue(
							'huggingface',
							'default_model',
							'AI_HUGGINGFACE_DEFAULT_MODEL'
						)) ||
						'mistralai/Mistral-7B-Instruct-v0.2';
					const apiUrl = baseUrl ? url : `https://api-inference.huggingface.co/models/${model}`;

					// Hugging Face Inference API egyszerűbb formátum
					let prompt = `${languageInstruction}\n\n${data.message}`;
					if (data.conversationHistory && data.conversationHistory.length > 0) {
						// Conversation history hozzáfűzése a prompthoz
						const history = data.conversationHistory
							.map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
							.join('\n');
						prompt = `${languageInstruction}\n\n${history}\nUser: ${data.message}\nAssistant:`;
					}

					const response = await fetch(apiUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${apiKey}`
						},
						body: JSON.stringify({
							inputs: prompt,
							parameters: {
								max_new_tokens: 512,
								temperature: 0.7
							}
						})
					});

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						return {
							success: false,
							error: `Hugging Face API hiba: ${errorData.error || response.statusText}`
						};
					}

					const result = await response.json();
					const text = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;

					if (!text) {
						return {
							success: false,
							error: 'Nem érkezett válasz az AI-tól.'
						};
					}

					return {
						success: true,
						response: text
					};
				}

				case 'custom': {
					if (!baseUrl) {
						return {
							success: false,
							error: 'Egyéni endpoint esetén az alap URL megadása kötelező'
						};
					}

					// OpenAI-kompatibilis formátum
					const messages = [];

					// System message hozzáadása a nyelvi beállítással
					messages.push({
						role: 'system',
						content: languageInstruction
					});

					if (data.conversationHistory && data.conversationHistory.length > 0) {
						for (const msg of data.conversationHistory) {
							messages.push({
								role: msg.role,
								content: msg.content
							});
						}
					}
					messages.push({
						role: 'user',
						content: data.message
					});

					const response = await fetch(baseUrl, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${apiKey}`
						},
						body: JSON.stringify({
							model:
								modelName ||
								(await getProviderConfigValue(
									'custom',
									'default_model',
									'AI_CUSTOM_DEFAULT_MODEL'
								)) ||
								'default',
							messages
						})
					});

					if (!response.ok) {
						return {
							success: false,
							error: `Egyéni API hiba: ${response.statusText}`
						};
					}

					const result = await response.json();
					const text = result.choices?.[0]?.message?.content;

					if (!text) {
						return {
							success: false,
							error: 'Nem érkezett válasz az AI-tól.'
						};
					}

					return {
						success: true,
						response: text
					};
				}

				default:
					return {
						success: false,
						error: 'Ismeretlen provider típus'
					};
			}
		} catch (err) {
			console.error('[AiChat] Hiba:', err);
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Ismeretlen hiba történt.'
			};
		}
	}
);

// ============================================================================
// getWelcomeMessage — üdvözlő üzenet generálása avatar névvel
// ============================================================================

export const getWelcomeMessage = command(
	v.object({}),
	async (): Promise<GetWelcomeMessageResult> => {
		const event = getRequestEvent();
		const { locals } = event;

		if (!locals.user?.id) {
			return { success: false, error: 'Nem vagy bejelentkezve.' };
		}

		try {
			const userId = parseInt(locals.user.id);

			// Avatar konfiguráció lekérése
			const avatarConfig = await avatarRepository.getUserAvatarConfig(userId);

			// Avatar név meghatározása
			let avatarName = 'AI Asszisztens';
			if (avatarConfig?.customName) {
				avatarName = avatarConfig.customName;
			} else if (avatarConfig?.avatarIdname) {
				// Ha nincs custom név, de van avatar, akkor az avatar display name-t használjuk
				const avatar = await avatarRepository.findAvatarByIdname(avatarConfig.avatarIdname);
				if (avatar) {
					avatarName = avatar.displayName;
				}
			}

			// Nyelvi beállítás meghatározása
			const userLocale = locals.locale || 'hu';

			// Üdvözlő üzenet generálása
			let welcomeMessage: string;
			if (userLocale === 'hu') {
				welcomeMessage = `Szia! ${avatarName} vagyok. Miben segíthetek?`;
			} else {
				welcomeMessage = `Hello! I'm ${avatarName}. How can I help you?`;
			}

			return {
				success: true,
				message: welcomeMessage
			};
		} catch (err) {
			console.error('[AiChat] Üdvözlő üzenet hiba:', err);
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Ismeretlen hiba történt.'
			};
		}
	}
);
