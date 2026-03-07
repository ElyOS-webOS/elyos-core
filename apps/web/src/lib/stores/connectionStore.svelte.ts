/**
 * Szerver kapcsolat figyelő store.
 *
 * Periodikusan ellenőrzi a szerver elérhetőségét és értesíti a felhasználót
 * ha a kapcsolat megszakad. Amikor a szerver újra elérhető, automatikusan
 * újratölti az oldalt a konzisztens állapot érdekében.
 */
import { browser } from '$app/environment';
import { toast } from 'svelte-sonner';

const HEALTH_CHECK_INTERVAL = 15_000; // 15 másodperc
const HEALTH_CHECK_TIMEOUT = 5_000; // 5 másodperc
const HEALTH_CHECK_URL = '/api/health';

class ConnectionStore {
	connected = $state(true);
	private intervalId: ReturnType<typeof setInterval> | null = null;
	private wasDisconnected = false;
	private toastId: string | number | undefined = undefined;

	start() {
		if (!browser || this.intervalId) return;

		this.intervalId = setInterval(() => {
			this.check();
		}, HEALTH_CHECK_INTERVAL);

		// Böngésző online/offline események figyelése
		window.addEventListener('online', this.handleOnline);
		window.addEventListener('offline', this.handleOffline);
	}

	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		if (browser) {
			window.removeEventListener('online', this.handleOnline);
			window.removeEventListener('offline', this.handleOffline);
		}
	}

	private handleOnline = () => {
		this.check();
	};

	private handleOffline = () => {
		this.setDisconnected();
	};

	async check(): Promise<boolean> {
		if (!browser) return true;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

			const response = await fetch(HEALTH_CHECK_URL, {
				method: 'GET',
				signal: controller.signal,
				// Cache kikerülése
				headers: { 'Cache-Control': 'no-cache' }
			});

			clearTimeout(timeoutId);

			if (response.ok) {
				this.setConnected();
				return true;
			}

			this.setDisconnected();
			return false;
		} catch {
			this.setDisconnected();
			return false;
		}
	}

	private setConnected() {
		if (this.wasDisconnected) {
			// Szerver újra elérhető - oldal újratöltése a konzisztens állapot érdekében
			this.wasDisconnected = false;
			this.connected = true;

			if (this.toastId !== undefined) {
				toast.dismiss(this.toastId);
				this.toastId = undefined;
			}

			toast.success('A szerver újra elérhető. Az oldal újratöltődik...', {
				duration: 2000
			});

			setTimeout(() => {
				window.location.reload();
			}, 2000);
		}
		this.connected = true;
	}

	private setDisconnected() {
		if (!this.wasDisconnected) {
			this.wasDisconnected = true;
			this.connected = false;

			this.toastId = toast.error('A szerver nem elérhető. Ellenőrizd, hogy fut-e a szerver.', {
				duration: Infinity,
				important: true
			});
		}
	}
}

let connectionStore: ConnectionStore | null = null;

export function getConnectionStore(): ConnectionStore {
	if (!connectionStore) {
		connectionStore = new ConnectionStore();
	}
	return connectionStore;
}
