import { betterAuth } from 'better-auth';
import { baseAuthConfig, baseCustomSessionPlugin } from './config';

/**
 * Auth konfiguráció seed scriptekhez és nem-SvelteKit környezetekhez.
 * Ez tartalmazza a közös konfigurációt, de email verification nélkül és SvelteKit-specifikus pluginok nélkül.
 */
export const authForSeed = betterAuth({
	...baseAuthConfig,
	// Seed környezetben nem kérünk email megerősítést
	emailAndPassword: {
		enabled: true,
		...baseAuthConfig.emailAndPassword,
		requireEmailVerification: false
	},
	// Email verification konfigurációt eltávolítjuk seed környezetben
	emailVerification: undefined,
	plugins: [
		// Csak a közös pluginok, SvelteKit-specifikus pluginok nélkül
		baseCustomSessionPlugin
	]
});
