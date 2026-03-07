<script lang="ts">
	import '../appAdmin.css';
	import './protected.css';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import {
		AlertTriangle,
		Database,
		RefreshCw,
		Home,
		ServerCrash,
		FileQuestion,
		ShieldAlert
	} from 'lucide-svelte';

	$: status = $page.status;
	$: message = $page.error?.message || 'Ismeretlen hiba történt';

	$: isServiceUnavailable = status === 503 || message.includes('Service temporarily unavailable');
	$: isDatabaseError = isServiceUnavailable || message.includes('database');

	function handleReload() {
		window.location.reload();
	}

	// Get appropriate icon based on error type
	$: ErrorIcon = isDatabaseError
		? Database
		: isServiceUnavailable
			? ServerCrash
			: status === 404
				? FileQuestion
				: status === 403
					? ShieldAlert
					: AlertTriangle;
</script>

<div class="bg-background flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-2xl shadow-lg">
		<Card.Header class="space-y-6 pb-8 text-center">
			<!-- Error Icon with gradient background -->
			<div class="flex justify-center">
				<div
					class="from-primary/10 via-primary/5 ring-primary/20 ring-offset-background flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br to-transparent ring-2 ring-offset-4"
				>
					<svelte:component this={ErrorIcon} class="text-primary h-14 w-14" />
				</div>
			</div>

			<div class="space-y-3">
				<Card.Title class="text-5xl font-bold tracking-tight">{status}</Card.Title>
				<Card.Description class="text-xl font-medium">
					{#if isServiceUnavailable}
						A rendszer jelenleg nem elérhető
					{:else if status === 404}
						Az oldal nem található
					{:else if status === 403}
						Hozzáférés megtagadva
					{:else}
						Hiba történt
					{/if}
				</Card.Description>
			</div>
		</Card.Header>

		<Card.Content class="space-y-6 pb-8">
			<!-- Main Error Message -->
			<div class="border-border bg-muted/30 rounded-lg border p-6">
				<p class="text-muted-foreground text-center leading-relaxed">
					{#if isServiceUnavailable}
						Az adatbázis vagy a szolgáltatás átmenetileg nem elérhető. Kérjük, próbálja meg később,
						vagy lépjen kapcsolatba a rendszergazdával.
					{:else if status === 404}
						A keresett admin oldal nem található. Lehet, hogy eltávolították, vagy hibás a
						hivatkozás.
					{:else if status === 403}
						Nincs jogosultsága az oldal megtekintéséhez. Kérjük, jelentkezzen be megfelelő
						jogosultságokkal.
					{:else}
						{message}
					{/if}
				</p>
			</div>

			<!-- Action Buttons -->
			<div class="flex flex-col gap-3 sm:flex-row">
				<Button onclick={handleReload} variant="default" class="flex-1">
					<RefreshCw class="mr-2 h-4 w-4" />
					Újrapróbálás
				</Button>
				<Button href="/admin" variant="outline" class="flex-1">
					<Home class="mr-2 h-4 w-4" />
					Admin főoldal
				</Button>
			</div>

			<!-- Technical Information for Database Errors -->
			{#if isDatabaseError}
				<div
					class="rounded-lg border border-amber-200 bg-linear-to-br from-amber-50 to-amber-50/50 p-5 dark:border-amber-800/50 dark:from-amber-950/30 dark:to-amber-950/10"
				>
					<div class="flex items-start gap-3">
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50"
						>
							<AlertTriangle class="h-4 w-4 text-amber-600 dark:text-amber-400" />
						</div>
						<div class="space-y-2">
							<p class="font-semibold text-amber-900 dark:text-amber-100">Technikai információ</p>
							<p class="text-sm leading-relaxed text-amber-800 dark:text-amber-200">
								Az adatbázis kapcsolat nem hozható létre. Ellenőrizze, hogy az adatbázis szerver
								fut-e, és a kapcsolati beállítások helyesek-e. Ha a probléma továbbra is fennáll,
								tekintse meg a szerver naplókat további részletekért.
							</p>
						</div>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
