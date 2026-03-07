<script lang="ts">
	/**
	 * T Component - Translation Component
	 *
	 * Svelte komponens a fordítások megjelenítéséhez.
	 * Támogatja az interpolációt, HTML tartalmat és egyedi wrapper elemeket.
	 *
	 * Requirements: 1.5, 7.6
	 *
	 * @example
	 * <!-- Egyszerű használat -->
	 * <T key="common.welcome" />
	 *
	 * <!-- Interpolációval -->
	 * <T key="common.greeting" params={{ name: 'John' }} />
	 *
	 * <!-- HTML tartalommal -->
	 * <T key="common.richText" html />
	 *
	 * <!-- Egyedi wrapper elemmel -->
	 * <T key="common.title" tag="h1" />
	 */

	import type { Snippet } from 'svelte';
	import { getI18nService } from '../service.js';
	import type { TranslationParams } from '../types.js';
	import { sanitizeHtml, stripHtmlTags } from '../utils/sanitize.js';

	/**
	 * Props for the T component
	 */
	interface Props {
		/** Translation key (e.g., "common.welcome") */
		key: string;
		/** Interpolation parameters */
		params?: TranslationParams;
		/** HTML tag to wrap the translation (default: span) */
		tag?: keyof HTMLElementTagNameMap;
		/** Whether to render HTML content (default: false) */
		html?: boolean;
		/** Additional CSS classes */
		class?: string;
		/** Fallback content if translation is missing */
		fallback?: Snippet;
	}

	let {
		key,
		params,
		tag = 'span',
		html = false,
		class: className = '',
		fallback
	}: Props = $props();

	// Get the i18n service
	const i18nService = getI18nService();

	// Get the translation reactively
	let translation = $derived(i18nService.t(key, params));

	// Check if translation is missing (returns the key)
	let isMissing = $derived(translation === key);

	/**
	 * Sanitize HTML content for safe rendering
	 * Uses server-safe regex-based sanitization on server,
	 * and DOM-based sanitization on client for better accuracy
	 */
	function sanitizeForRender(content: string): string {
		if (typeof document === 'undefined') {
			// Server-side: strip all HTML tags for safety
			return stripHtmlTags(content);
		}

		// Client-side: use DOM-based sanitization for better accuracy
		const temp = document.createElement('div');
		temp.innerHTML = sanitizeHtml(content);

		// Additional DOM-based cleanup for any remaining dangerous elements
		const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
		dangerousElements.forEach((tag) => {
			const elements = temp.querySelectorAll(tag);
			elements.forEach((el) => el.remove());
		});

		// Remove dangerous attributes from all elements
		const dangerousAttributes = [
			'onclick',
			'onerror',
			'onload',
			'onmouseover',
			'onfocus',
			'onblur',
			'onchange',
			'onsubmit',
			'onkeydown',
			'onkeyup',
			'onkeypress'
		];

		const allElements = temp.querySelectorAll('*');
		allElements.forEach((el) => {
			dangerousAttributes.forEach((attr) => {
				el.removeAttribute(attr);
			});

			// Handle javascript: URLs
			const href = el.getAttribute('href');
			const src = el.getAttribute('src');
			if (href?.toLowerCase().startsWith('javascript:')) {
				el.removeAttribute('href');
			}
			if (src?.toLowerCase().startsWith('javascript:')) {
				el.removeAttribute('src');
			}
		});

		return temp.innerHTML;
	}

	// Sanitized HTML content
	let sanitizedContent = $derived(html ? sanitizeForRender(translation) : translation);
</script>

{#if isMissing && fallback}
	{@render fallback()}
{:else if html}
	<svelte:element this={tag} class={className}>
		{@html sanitizedContent}
	</svelte:element>
{:else}
	<svelte:element this={tag} class={className}>
		{translation}
	</svelte:element>
{/if}
