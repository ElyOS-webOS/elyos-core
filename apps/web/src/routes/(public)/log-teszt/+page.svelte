<script lang="ts">
	import { enhance } from '$app/forms';
	import { clientErrorReporter } from '$lib/logging/client-reporter';

	let { form } = $props();

	let clientLog = $state('');

	function triggerError() {
		try {
			throw new Error('Szándékos kliens oldali hiba');
		} catch (e) {
			if (e instanceof Error) {
				clientErrorReporter.report({
					message: e.message,
					stack: e.stack,
					context: { trigger: 'manual-button' }
				});
				clientLog = `[${new Date().toLocaleTimeString()}] Kliens hiba elküldve: ${e.message}`;
			}
		}
	}

	function triggerUnhandledError() {
		// Ez a hooks.client.ts handleError-on keresztül kerül naplózásra
		throw new Error('Kezeletlen kliens hiba a teszt oldalról');
	}

	function triggerPromiseRejection() {
		// Kezeletlen promise rejection
		Promise.reject(new Error('Kezeletlen Promise rejection a teszt oldalról'));
		clientLog = `[${new Date().toLocaleTimeString()}] Promise rejection kiváltva`;
	}

	function triggerTypeError() {
		try {
			const obj: any = null;
			obj.nonExistentMethod();
		} catch (e) {
			if (e instanceof Error) {
				clientErrorReporter.report({
					message: e.message,
					stack: e.stack,
					context: { trigger: 'type-error', type: 'TypeError' }
				});
				clientLog = `[${new Date().toLocaleTimeString()}] TypeError elküldve: ${e.message}`;
			}
		}
	}
</script>

<div class="mx-auto max-w-3xl p-8">
	<h1 class="mb-2 text-3xl font-bold">Hibanaplózó Teszt</h1>
	<p class="mb-8 text-gray-500">Különböző hibák kiváltása a naplózó rendszer teszteléséhez</p>

	{#if form?.success}
		<div class="mb-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800">
			Szerver naplóbejegyzés rögzítve: <strong>{form.level}</strong>
		</div>
	{/if}

	{#if form?.message}
		<div class="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
			Szerver fail válasz: <strong>{form.message}</strong>
		</div>
	{/if}

	{#if clientLog}
		<div class="mb-6 rounded-lg border border-blue-300 bg-blue-50 p-4 text-blue-800">
			{clientLog}
		</div>
	{/if}

	<!-- Szerver oldali naplózás -->
	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Szerver oldali naplózás</h2>
		<p class="mb-4 text-sm text-gray-500">
			Ezek a gombok közvetlenül a Logger-en keresztül rögzítenek bejegyzéseket.
		</p>
		<div class="flex flex-wrap gap-3">
			<form method="POST" action="?/debug" use:enhance>
				<button
					type="submit"
					class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
				>
					Debug
				</button>
			</form>
			<form method="POST" action="?/info" use:enhance>
				<button
					type="submit"
					class="rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
				>
					Info
				</button>
			</form>
			<form method="POST" action="?/warn" use:enhance>
				<button
					type="submit"
					class="rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-200"
				>
					Warn
				</button>
			</form>
			<form method="POST" action="?/error" use:enhance>
				<button
					type="submit"
					class="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
				>
					Error
				</button>
			</form>
			<form method="POST" action="?/fatal" use:enhance>
				<button
					type="submit"
					class="rounded-lg bg-red-200 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-300"
				>
					Fatal
				</button>
			</form>
		</div>
	</section>

	<!-- Szerver oldali hibák -->
	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Szerver oldali hibák</h2>
		<p class="mb-4 text-sm text-gray-500">
			Ezek a handleError hook-on vagy SvelteKit fail()-en keresztül működnek. A fail() validációs
			válasz, nem hiba — szándékosan nem naplózódik.
		</p>
		<div class="flex flex-wrap gap-3">
			<form method="POST" action="?/server-throw" use:enhance>
				<button
					type="submit"
					class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
				>
					Szerver throw Error
				</button>
			</form>
			<form method="POST" action="?/server-fail" use:enhance>
				<button
					type="submit"
					class="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
				>
					Szerver fail(422)
				</button>
			</form>
		</div>
	</section>

	<!-- Kliens oldali hibák -->
	<section class="mb-8">
		<h2 class="mb-4 text-xl font-semibold">Kliens oldali hibák</h2>
		<p class="mb-4 text-sm text-gray-500">
			Ezek a ClientErrorReporter-en vagy a kliens handleError hook-on keresztül működnek.
		</p>
		<div class="flex flex-wrap gap-3">
			<button
				onclick={triggerError}
				class="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200"
			>
				Kliens Error (kezelt)
			</button>
			<button
				onclick={triggerTypeError}
				class="rounded-lg bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200"
			>
				TypeError (kezelt)
			</button>
			<button
				onclick={triggerUnhandledError}
				class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
			>
				Kezeletlen Error
			</button>
			<button
				onclick={triggerPromiseRejection}
				class="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
			>
				Promise Rejection
			</button>
		</div>
	</section>

	<section class="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
		<h3 class="mb-2 font-semibold">Tippek</h3>
		<ul class="list-inside list-disc space-y-1">
			<li>A konzolban (szerver + böngésző) láthatod a naplóbejegyzéseket</li>
			<li>Ha a file transport aktív, nézd meg a <code>logs/</code> mappát</li>
			<li>Ha a database transport aktív, nézd meg a <code>platform.error_logs</code> táblát</li>
			<li>A "Kezeletlen Error" gomb a SvelteKit handleError hook-ot teszteli</li>
			<li>A LOG_LEVEL beállítás határozza meg, mely szintek kerülnek rögzítésre</li>
		</ul>
	</section>
</div>
