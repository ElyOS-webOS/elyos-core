<script lang="ts">
	import { sendNotification } from '$lib/services/client/notificationService';
	import { getAppContext } from '$lib/services/client/appContext';
	import { getNotificationStore } from '$lib/stores/notificationStore.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';

	const appContext = getAppContext();
	const notificationStore = getNotificationStore();

	// Get userId from page data
	let userId = $derived($page.data.user?.id ? parseInt($page.data.user.id) : undefined);

	let title = $state('Teszt Értesítés');
	let message = $state('Ez egy teszt értesítés az értesítési rendszerből');
	let type = $state<'info' | 'success' | 'warning' | 'error' | 'critical'>('info');
	let appName = $state('notification-demo');
	let useI18n = $state(true); // Toggle for i18n support
	let sending = $state(false);

	async function handleSendNotification() {
		if (!title || !message) {
			toast.error('Kérlek töltsd ki a címet és az üzenetet!');
			return;
		}

		if (!userId) {
			toast.error('Hiba: Nincs bejelentkezve felhasználó!');
			console.error('userId is undefined:', { userId, pageData: $page.data });
			return;
		}

		sending = true;
		try {
			console.log('Sending notification with userId:', userId);

			// Prepare notification payload with i18n support
			const notificationPayload: any = {
				userId,
				appName,
				type,
				data: { timestamp: new Date().toISOString() }
			};

			// Add title and message (with or without i18n)
			if (useI18n) {
				notificationPayload.title = {
					hu: title,
					en: `Test Notification`
				};
				notificationPayload.message = {
					hu: message,
					en: `This is a test notification from the notification system`
				};
			} else {
				notificationPayload.title = title;
				notificationPayload.message = message;
			}

			await sendNotification(notificationPayload);

			toast.success('Értesítés sikeresen elküldve!');

			// Dev módban frissítsük az értesítéseket (toast megjelenik a reload során)
			if (import.meta.env.DEV) {
				setTimeout(() => {
					notificationStore.reload();
				}, 500);
			}
		} catch (error) {
			console.error('Hiba az értesítés küldésekor:', error);
			toast.error('Hiba történt az értesítés küldésekor!');
		} finally {
			sending = false;
		}
	}

	async function handleCreateTestNotification() {
		sending = true;
		try {
			const response = await fetch('/api/notifications/test', {
				method: 'POST'
			});

			const data = await response.json();

			if (response.ok) {
				toast.success(data.message);
				// Dev módban frissítsük az értesítéseket (toast megjelenik a reload során)
				if (import.meta.env.DEV) {
					setTimeout(() => {
						notificationStore.reload();
					}, 500);
				}
			} else {
				console.error('Test notification error:', data);
				toast.error(
					'Hiba: ' + (data.error || 'Ismeretlen hiba') + (data.details ? ' - ' + data.details : '')
				);
			}
		} catch (error) {
			console.error('Hiba a teszt értesítés létrehozásakor:', error);
			toast.error('Hiba történt! Nézd meg a konzolt a részletekért.');
		} finally {
			sending = false;
		}
	}

	async function handleSendBroadcast() {
		sending = true;
		try {
			await sendNotification({
				broadcast: true,
				title: 'Broadcast Értesítés',
				message: 'Ez egy broadcast üzenet minden felhasználónak',
				type: 'warning'
			});

			toast.success('Broadcast értesítés sikeresen elküldve!');

			// Dev módban frissítsük az értesítéseket (toast megjelenik a reload során)
			if (import.meta.env.DEV) {
				setTimeout(() => {
					notificationStore.reload();
				}, 500);
			}
		} catch (error) {
			console.error('Hiba a broadcast küldésekor:', error);
			toast.error('Hiba történt a broadcast küldésekor!');
		} finally {
			sending = false;
		}
	}
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<h1 class="text-2xl font-bold">Értesítési Rendszer Demo</h1>

	<Card.Root>
		<Card.Header>
			<Card.Title>Értesítés Küldése</Card.Title>
			<Card.Description>Küldj egy tesztelési célú értesítést saját magadnak</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<Label for="title">Cím</Label>
				<Input id="title" bind:value={title} placeholder="Értesítés címe" />
			</div>

			<div class="space-y-2">
				<Label for="message">Üzenet</Label>
				<Input id="message" bind:value={message} placeholder="Értesítés üzenete" />
			</div>

			<div class="space-y-2">
				<Label for="type">Típus</Label>
				<select
					id="type"
					bind:value={type}
					class="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					<option value="info">Info</option>
					<option value="success">Success</option>
					<option value="warning">Warning</option>
					<option value="error">Error</option>
					<option value="critical">Critical</option>
				</select>
			</div>

			<div class="space-y-2">
				<Label for="appName">App Név (opcionális)</Label>
				<Input id="appName" bind:value={appName} placeholder="notification-demo" />
			</div>

			<div class="flex items-center space-x-2">
				<input type="checkbox" id="useI18n" bind:checked={useI18n} class="h-4 w-4" />
				<Label for="useI18n">Többnyelvű értesítés (HU/EN)</Label>
			</div>
		</Card.Content>
		<Card.Footer class="flex gap-2">
			<Button onclick={handleSendNotification} disabled={sending}>
				{sending ? 'Küldés...' : 'Értesítés Küldése'}
			</Button>
			<Button variant="secondary" onclick={handleCreateTestNotification} disabled={sending}>
				Gyors Teszt (Dev)
			</Button>
			<Button variant="outline" onclick={handleSendBroadcast} disabled={sending}>
				Broadcast Küldése
			</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Használati Útmutató</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-2 text-sm">
			<p>
				<strong>1.</strong> Töltsd ki a fenti űrlapot és kattints az "Értesítés Küldése" gombra.
			</p>
			<p>
				<strong>2.</strong> Az értesítés megjelenik a taskbar harang ikonjában.
			</p>
			<p>
				<strong>3.</strong> Ha az app név meg van adva, a taskbar ablak gombon is megjelenik egy badge.
			</p>
			<p>
				<strong>4.</strong> Kattints a harang ikonra az értesítési központ megnyitásához.
			</p>
			<p>
				<strong>5.</strong> Kattints egy értesítésre az olvasottnak jelöléséhez és az app megnyitásához.
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>API Példák</Card.Title>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div>
				<h3 class="mb-2 font-semibold">Többnyelvű értesítés app megnyitással:</h3>
				<pre class="bg-muted rounded p-3 text-xs"><code
						>{`await sendNotification({
  userId: 123,
  appName: 'users',
  title: {
    hu: 'Új csoport létrehozva',
    en: 'New group created'
  },
  message: {
    hu: 'A "Fejlesztők" csoport sikeresen létrehozva',
    en: 'The "Developers" group has been successfully created'
  },
  details: {
    hu: 'A csoport 5 taggal rendelkezik...',
    en: 'The group has 5 members...'
  },
  type: 'success',
  data: {
    section: 'groups',
    groupId: '456'
  }
});`}</code
					></pre>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">Értesítés app megnyitással és sidebar menüponttal:</h3>
				<pre class="bg-muted rounded p-3 text-xs"><code
						>{`await sendNotification({
  userId: 123,
  appName: 'users',
  title: 'Új csoport létrehozva',
  message: 'A "Fejlesztők" csoport sikeresen létrehozva',
  type: 'success',
  data: {
    section: 'groups',  // Melyik sidebar menüpont legyen aktív
    groupId: '456',
    action: 'view'
  }
});`}</code
					></pre>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">Értesítés app megnyitással és paraméterekkel:</h3>
				<pre class="bg-muted rounded p-3 text-xs"><code
						>{`await sendNotification({
  userId: 123,
  appName: 'file-manager',
  title: 'Fájl feltöltve',
  message: 'A dokumentum sikeresen feltöltve',
  type: 'success',
  data: {
    fileId: '456',
    folderId: '789',
    action: 'view'
  }
});`}</code
					></pre>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">Egyszerű értesítés app megnyitás nélkül:</h3>
				<pre class="bg-muted rounded p-3 text-xs"><code
						>{`await sendNotification({
  userId: 123,
  title: 'Emlékeztető',
  message: 'Ne felejtsd el a meetinget 15:00-kor',
  type: 'info'
  // appName nélkül nem nyit meg app-ot
});`}</code
					></pre>
			</div>

			<div>
				<h3 class="mb-2 font-semibold">Broadcast értesítés:</h3>
				<pre class="bg-muted rounded p-3 text-xs"><code
						>{`await sendNotification({
  broadcast: true,
  title: 'Rendszer karbantartás',
  message: 'A rendszer 10 perc múlva leáll',
  type: 'warning'
});`}</code
					></pre>
			</div>
		</Card.Content>
	</Card.Root>
</div>
