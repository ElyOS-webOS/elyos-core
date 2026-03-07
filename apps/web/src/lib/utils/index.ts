/**
 * Segédprogramok központi exportja
 * Ez a fájl összegyűjti és exportálja az összes segédprogramot a könnyebb importálás érdekében
 */

// Általános segédprogramok
export { cn, capitalizeFirstLetter } from './utils.js';

export type {
	WithoutChild,
	WithoutChildren,
	WithoutChildrenOrChild,
	WithElementRef
} from './utils.js';

// Validációs segédprogramok (szerver és kliens oldalon is használható)
export { localizedTextSchema } from './validation.js';
export type { LocalizedText } from './validation.js';

// Ikon betöltő segédprogramok
export {
	ICON_TYPES,
	detectIconType,
	loadIcon,
	clearIconCache
} from '../services/client/iconLoader.js';

export type { IconType, LucideIconProps, IconData } from '../services/client/iconLoader.js';

// Screenshot segédprogramok
export { takeWindowScreenshot } from '../services/client/screenshot.js';

// Remote function segédprogramok
export { withTimeout, RemoteTimeoutError } from './remote.js';
