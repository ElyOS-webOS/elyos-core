/**
 * Kontextus interpoláció segédfüggvény.
 * A `{{kulcs}}` formátumú helyőrzőket a kontextus megfelelő értékeivel helyettesíti.
 */

/**
 * Behelyettesíti a sablonban lévő `{{kulcs}}` helyőrzőket a kontextus értékeivel.
 * Ha egy kulcs nem szerepel a kontextusban, a helyőrző változatlan marad.
 *
 * @param template - A sablon szöveg `{{kulcs}}` helyőrzőkkel
 * @param context - A behelyettesítendő kulcs-érték párok
 * @returns A behelyettesített szöveg
 */
export function interpolate(template: string, context: Record<string, unknown>): string {
	return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
		if (Object.prototype.hasOwnProperty.call(context, key)) {
			return String(context[key]);
		}
		return match;
	});
}
