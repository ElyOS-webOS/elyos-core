import { createAuthClient } from 'better-auth/svelte';
import { twoFactorClient, emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
	plugins: [emailOTPClient(), twoFactorClient()]
});

export type AuthClient = typeof authClient;
