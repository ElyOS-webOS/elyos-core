// A Varlock már validálta és feltöltötte a process.env-t indításkor.
// Ez a fájl csak re-exportálja a typesafe értékeket — az összes
// meglévő `import { env } from '$lib/env'` import változatlan marad.

// Az src/env.d.ts fájlt a Varlock generálja a .env.schema @generateTypes dekorátora alapján
import type { CoercedEnvSchema as Env } from '../env.d.ts';

// Boolean string értékek coercion-je: "true" -> true, "false" -> false
// A process.env minden értéke string, de a típusok boolean-t várnak
function coerceEnv(raw: NodeJS.ProcessEnv): Env {
	return new Proxy(raw as unknown as Record<string, unknown>, {
		get(target, key: string) {
			const val = target[key];
			if (val === 'true') return true;
			if (val === 'false') return false;
			return val;
		}
	}) as unknown as Env;
}

export const env = coerceEnv(process.env);
