# ContentSection használata plugin-ban - Példa

## Vanilla JavaScript példa

```javascript
// plugin-settings.js

// 1. Szerezd meg a ContentSection komponenst az SDK-ból
const ContentSection = window.webOS.components.ContentSection;
const Button = window.webOS.components.Button;

// 2. Hozz létre egy konténert
const container = document.getElementById('settings-root');

// 3. Használd a Svelte mount API-t
import { mount } from 'svelte';

// 4. Rendereld a ContentSection-t
const settingsSection = mount(ContentSection, {
	target: container,
	props: {
		title: 'Tálca beállítások',
		description: 'Állítsd be a tálca megjelenését',
		contentPosition: 'bottom',
		children: (target) => {
			// Gombok konténer
			const buttonGroup = document.createElement('div');
			buttonGroup.className = 'button-groups';
			buttonGroup.style.display = 'flex';
			buttonGroup.style.gap = '0.5rem';

			// Felső gomb
			const topButton = document.createElement('button');
			topButton.textContent = 'Felül';
			topButton.onclick = () => handlePositionChange('top');

			// Alsó gomb
			const bottomButton = document.createElement('button');
			bottomButton.textContent = 'Alul';
			bottomButton.onclick = () => handlePositionChange('bottom');

			buttonGroup.appendChild(topButton);
			buttonGroup.appendChild(bottomButton);

			return buttonGroup;
		},
		info: (target) => {
			const info = document.createElement('p');
			info.textContent = 'A tálca pozíciója azonnal frissül a kiválasztás után.';
			return info;
		}
	}
});

function handlePositionChange(position) {
	console.log('Pozíció változás:', position);
	// Itt hívd meg az SDK remote service-t a beállítás mentéséhez
	window.webOS.remote.call('updateSettings', {
		taskbar: { position }
	});
}
```

## Svelte komponens példa (ha a plugin Svelte-ben íródik)

```svelte
<!-- PluginSettings.svelte -->
<script>
	// Importáld a ContentSection-t az SDK-ból
	const ContentSection = window.webOS.components.ContentSection;
	const Button = window.webOS.components.Button;

	let taskbarPosition = 'bottom';

	async function handlePositionChange(position) {
		taskbarPosition = position;

		// Mentsd a beállítást
		const result = await window.webOS.remote.call('updateSettings', {
			taskbar: { position }
		});

		if (result.success) {
			window.webOS.ui.toast('Beállítás mentve!', { type: 'success' });
		}
	}
</script>

<div class="settings-container">
	<h2>Plugin beállítások</h2>

	<ContentSection
		title="Tálca pozíció"
		description="Válaszd ki, hol jelenjen meg a tálca"
		contentPosition="bottom"
	>
		{#snippet info()}
			A tálca pozíciója azonnal frissül a kiválasztás után.
		{/snippet}

		<div class="button-groups">
			<Button
				variant={taskbarPosition === 'top' ? 'default' : 'outline'}
				size="sm"
				onclick={() => handlePositionChange('top')}
			>
				Felül
			</Button>
			<Button
				variant={taskbarPosition === 'bottom' ? 'default' : 'outline'}
				size="sm"
				onclick={() => handlePositionChange('bottom')}
			>
				Alul
			</Button>
		</div>
	</ContentSection>
</div>

<style>
	.settings-container {
		padding: 1rem;
	}

	.button-groups {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
</style>
```

## Több ContentSection használata

```svelte
<script>
	const ContentSection = window.webOS.components.ContentSection;
	const Switch = window.webOS.components.Switch;

	let notifications = {
		email: true,
		push: false,
		sms: true
	};

	async function handleNotificationChange(type, value) {
		notifications[type] = value;
		await window.webOS.remote.call('updateNotificationSettings', notifications);
	}
</script>

<div class="settings-page">
	<h1>Értesítési beállítások</h1>

	<!-- Email értesítések -->
	<ContentSection
		title="Email értesítések"
		description="Kapj email-t az új eseményekről"
		contentPosition="right"
	>
		<Switch
			checked={notifications.email}
			onCheckedChange={(checked) => handleNotificationChange('email', checked)}
		/>
	</ContentSection>

	<!-- Push értesítések -->
	<ContentSection
		title="Push értesítések"
		description="Böngésző értesítések engedélyezése"
		contentPosition="right"
	>
		{#snippet info()}
			A böngésző engedélyt fog kérni az értesítések megjelenítéséhez.
		{/snippet}

		<Switch
			checked={notifications.push}
			onCheckedChange={(checked) => handleNotificationChange('push', checked)}
		/>
	</ContentSection>

	<!-- SMS értesítések -->
	<ContentSection
		title="SMS értesítések"
		description="Sürgős események SMS-ben"
		contentPosition="right"
		disabled={!notifications.email}
	>
		{#snippet info()}
			Az SMS értesítésekhez email értesítésnek is engedélyezve kell lennie.
		{/snippet}

		<Switch
			checked={notifications.sms}
			disabled={!notifications.email}
			onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
		/>
	</ContentSection>
</div>
```

## Előnyök

1. **Konzisztens megjelenés**: A ContentSection automatikusan használja a WebOS core stílusokat
2. **Téma támogatás**: Automatikusan követi a világos/sötét módot
3. **Reszponzív**: Mobilon és asztalon is jól néz ki
4. **Karbantartható**: Ha a core frissül, a plugin is megkapja az új stílusokat
5. **Egyszerű használat**: Nem kell saját CSS-t írni a layout-hoz
