import type { WebOSSDKInterface } from './index.js';

declare global {
	interface Window {
		webOS?: WebOSSDKInterface;
		__webOS_instances?: Map<string, WebOSSDKInterface>;
	}
}
