<script lang="ts">
	import './admin/appAdmin.css';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle, ServerCrash, FileQuestion, ShieldAlert } from 'lucide-svelte';

	$: status = $page.status;
	$: message = $page.error?.message || 'Ismeretlen hiba történt';

	// Determine if this is a database/service unavailable error
	$: isServiceUnavailable = status === 503 || status === 500;

	function handleReload() {
		window.location.reload();
	}

	// Get appropriate icon based on error type
	$: ErrorIcon = isServiceUnavailable
		? ServerCrash
		: status === 404
			? FileQuestion
			: status === 403
				? ShieldAlert
				: AlertTriangle;
</script>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-lg space-y-8">
		<!-- Error Icon & Status -->
		<div class="flex flex-col items-center space-y-4 text-center">
			<div
				class="from-primary/10 to-primary/5 ring-primary/20 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br ring-1"
			>
				<svelte:component this={ErrorIcon} class="text-primary h-12 w-12" />
			</div>

			<div class="space-y-2">
				<h1 class="text-foreground text-6xl font-bold tracking-tight">{status}</h1>
				<h2 class="text-foreground text-2xl font-semibold">
					{#if isServiceUnavailable}
						A rendszer jelenleg nem elérhető
					{:else if status === 404}
						Az oldal nem található
					{:else if status === 403}
						Hozzáférés megtagadva
					{:else}
						Hiba történt
					{/if}
				</h2>
			</div>
		</div>

		<!-- Error Message -->
		<div class="border-border bg-card rounded-lg border p-6 shadow-sm">
			<p class="text-muted-foreground text-center">
				{#if isServiceUnavailable}
					Kérjük, próbálja meg később. A szolgáltatás átmenetileg nem elérhető, vagy az adatbázis
					kapcsolat megszakadt.
				{:else if status === 404}
					A keresett oldal nem található. Lehet, hogy eltávolították, vagy hibás a hivatkozás.
				{:else if status === 403}
					Nincs jogosultsága az oldal megtekintéséhez. Kérjük, jelentkezzen be megfelelő
					jogosultságokkal.
				{:else}
					{message}
				{/if}
			</p>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			<Button onclick={handleReload} variant="default" class="sm:min-w-[160px]">
				Újrapróbálás
			</Button>
			<Button href="/" variant="outline" class="sm:min-w-[160px]">Vissza a főoldalra</Button>
		</div>

		<!-- Additional Help Text -->
		{#if isServiceUnavailable}
			<div
				class="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20"
			>
				<p class="text-center text-sm text-amber-800 dark:text-amber-200">
					Ha a probléma továbbra is fennáll, kérjük, lépjen kapcsolatba a rendszergazdával.
				</p>
			</div>
		{/if}
	</div>
</div>
