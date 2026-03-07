/**
 * HTML Sanitization Utility
 *
 * Provides functions to sanitize HTML content to prevent XSS attacks.
 * Removes dangerous elements and attributes while preserving safe HTML.
 *
 * Requirements: 7.6
 */

/**
 * List of HTML elements that are considered dangerous and should be removed
 */
export const DANGEROUS_ELEMENTS = [
	'script',
	'iframe',
	'object',
	'embed',
	'form',
	'input',
	'button'
] as const;

/**
 * List of HTML attributes that are considered dangerous and should be removed
 */
export const DANGEROUS_ATTRIBUTES = [
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
	'onkeypress',
	'onmousedown',
	'onmouseup',
	'onmousemove',
	'ondblclick',
	'oncontextmenu',
	'ondrag',
	'ondragend',
	'ondragenter',
	'ondragleave',
	'ondragover',
	'ondragstart',
	'ondrop',
	'oninput',
	'oninvalid',
	'onreset',
	'onscroll',
	'onselect',
	'onwheel'
] as const;

/**
 * List of dangerous URL protocols that should be removed from href/src attributes
 */
export const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:'] as const;

export type DangerousElement = (typeof DANGEROUS_ELEMENTS)[number];
export type DangerousAttribute = (typeof DANGEROUS_ATTRIBUTES)[number];
export type DangerousProtocol = (typeof DANGEROUS_PROTOCOLS)[number];

/**
 * Check if a string contains any dangerous elements
 */
export function containsDangerousElement(html: string): boolean {
	const lowerHtml = html.toLowerCase();
	return DANGEROUS_ELEMENTS.some(
		(element) =>
			lowerHtml.includes(`<${element}`) ||
			lowerHtml.includes(`<${element}>`) ||
			lowerHtml.includes(`<${element} `)
	);
}

/**
 * Check if a string contains any dangerous attributes
 */
export function containsDangerousAttribute(html: string): boolean {
	const lowerHtml = html.toLowerCase();
	return DANGEROUS_ATTRIBUTES.some((attr) => lowerHtml.includes(`${attr}=`));
}

/**
 * Check if a string contains any dangerous protocols
 */
export function containsDangerousProtocol(html: string): boolean {
	const lowerHtml = html.toLowerCase();
	return DANGEROUS_PROTOCOLS.some((protocol) => lowerHtml.includes(protocol));
}

/**
 * Sanitize HTML content by removing dangerous elements and attributes.
 * This is a server-safe implementation that works without DOM.
 *
 * @param content - The HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(content: string): string {
	if (!content || typeof content !== 'string') {
		return '';
	}

	let result = content;

	// Remove dangerous elements with their content (including empty content)
	for (const element of DANGEROUS_ELEMENTS) {
		// Remove opening and closing tags with any content (including empty)
		const openCloseRegex = new RegExp(`<${element}[^>]*>[\\s\\S]*?<\\/${element}>`, 'gi');
		result = result.replace(openCloseRegex, '');

		// Remove self-closing tags
		const selfClosingRegex = new RegExp(`<${element}[^>]*\\/?>`, 'gi');
		result = result.replace(selfClosingRegex, '');

		// Remove orphaned closing tags
		const closingTagRegex = new RegExp(`<\\/${element}>`, 'gi');
		result = result.replace(closingTagRegex, '');
	}

	// Remove dangerous attributes
	for (const attr of DANGEROUS_ATTRIBUTES) {
		// Match attribute with double quotes
		const doubleQuoteRegex = new RegExp(`\\s*${attr}\\s*=\\s*"[^"]*"`, 'gi');
		result = result.replace(doubleQuoteRegex, '');

		// Match attribute with single quotes
		const singleQuoteRegex = new RegExp(`\\s*${attr}\\s*=\\s*'[^']*'`, 'gi');
		result = result.replace(singleQuoteRegex, '');

		// Match attribute without quotes
		const noQuoteRegex = new RegExp(`\\s*${attr}\\s*=\\s*[^\\s>]+`, 'gi');
		result = result.replace(noQuoteRegex, '');
	}

	// Remove dangerous protocols from href and src attributes
	for (const protocol of DANGEROUS_PROTOCOLS) {
		// Match href with dangerous protocol
		const hrefDoubleRegex = new RegExp(`href\\s*=\\s*"${protocol}[^"]*"`, 'gi');
		result = result.replace(hrefDoubleRegex, 'href=""');

		const hrefSingleRegex = new RegExp(`href\\s*=\\s*'${protocol}[^']*'`, 'gi');
		result = result.replace(hrefSingleRegex, "href=''");

		// Match src with dangerous protocol
		const srcDoubleRegex = new RegExp(`src\\s*=\\s*"${protocol}[^"]*"`, 'gi');
		result = result.replace(srcDoubleRegex, 'src=""');

		const srcSingleRegex = new RegExp(`src\\s*=\\s*'${protocol}[^']*'`, 'gi');
		result = result.replace(srcSingleRegex, "src=''");
	}

	return result;
}

/**
 * Strip all HTML tags from content (for server-side rendering)
 *
 * @param content - The HTML content to strip
 * @returns Plain text content
 */
export function stripHtmlTags(content: string): string {
	if (!content || typeof content !== 'string') {
		return '';
	}
	return content.replace(/<[^>]*>/g, '');
}

/**
 * Check if sanitized content is safe (contains no dangerous elements/attributes/protocols)
 *
 * @param content - The content to check
 * @returns true if content is safe, false otherwise
 */
export function isSafeHtml(content: string): boolean {
	return (
		!containsDangerousElement(content) &&
		!containsDangerousAttribute(content) &&
		!containsDangerousProtocol(content)
	);
}
