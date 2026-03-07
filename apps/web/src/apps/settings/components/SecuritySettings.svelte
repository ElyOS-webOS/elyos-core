<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
	import { authClient } from '$lib/auth/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { useI18n } from '$lib/i18n/hooks';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	const { t } = useI18n();

	let session = $state<any>(null);
	let isLoading = $state(false);
	let showSetup = $state(false);
	let qrCodeUri = $state('');
	let verificationCode = $state('');
	let password = $state('');
	let backupCodes = $state<string[]>([]);
	let showBackupCodes = $state(false);

	// Password change state
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let isChangingPassword = $state(false);

	onMount(async () => {
		const { data } = await authClient.getSession();
		session = data;
	});

	const handleEnable2FA = async () => {
		if (!password) {
			toast.error(t('settings.security.2fa.errors.passwordRequired'));
			return;
		}

		isLoading = true;
		try {
			const result = await authClient.twoFactor.enable({
				password: password
			});

			if (result.error) {
				const errorMessage = result.error.message || '';

				if (errorMessage.includes('Invalid password') || errorMessage.includes('password')) {
					toast.error(t('settings.security.2fa.errors.incorrectPassword'));
				} else {
					toast.error(t('settings.security.2fa.errors.enableFailed'));
				}
				return;
			}

			if (result.data) {
				qrCodeUri = result.data.totpURI;
				backupCodes = result.data.backupCodes || [];
				showSetup = true;
				password = '';
				toast.success(t('settings.security.2fa.setupStarted'));
			}
		} catch (error: any) {
			toast.error(error.message || t('settings.security.2fa.errors.enableFailed'));
		} finally {
			isLoading = false;
		}
	};

	const handleVerifyAndComplete = async () => {
		if (!verificationCode) {
			toast.error(t('settings.security.2fa.errors.codeRequired'));
			return;
		}

		isLoading = true;
		try {
			await authClient.twoFactor.verifyTotp({
				code: verificationCode
			});

			toast.success(t('settings.security.2fa.enabled'));
			showSetup = false;
			showBackupCodes = true;
			verificationCode = '';

			// Frissítjük a session-t
			const { data } = await authClient.getSession();
			session = data;
		} catch (error: any) {
			toast.error(error.message || t('settings.security.2fa.errors.verifyFailed'));
		} finally {
			isLoading = false;
		}
	};

	const handleDisable2FA = async () => {
		if (!password) {
			toast.error(t('settings.security.2fa.errors.passwordRequired'));
			return;
		}

		isLoading = true;
		try {
			const result = await authClient.twoFactor.disable({
				password: password
			});

			if (result.error) {
				const errorMessage = result.error.message || '';

				if (errorMessage.includes('Invalid password') || errorMessage.includes('password')) {
					toast.error(t('settings.security.2fa.errors.incorrectPassword'));
				} else {
					toast.error(t('settings.security.2fa.errors.disableFailed'));
				}
				return;
			}

			toast.success(t('settings.security.2fa.disabled'));
			password = '';

			// Frissítjük a session-t
			const { data } = await authClient.getSession();
			session = data;
		} catch (error: any) {
			toast.error(error.message || t('settings.security.2fa.errors.disableFailed'));
		} finally {
			isLoading = false;
		}
	};

	const handleGenerateBackupCodes = async () => {
		if (!password) {
			toast.error(t('settings.security.2fa.errors.passwordRequired'));
			return;
		}

		isLoading = true;
		try {
			const result = await authClient.twoFactor.generateBackupCodes({
				password: password
			});

			if (result.error) {
				const errorMessage = result.error.message || '';

				if (errorMessage.includes('Invalid password') || errorMessage.includes('password')) {
					toast.error(t('settings.security.2fa.errors.incorrectPassword'));
				} else {
					toast.error(t('settings.security.2fa.errors.backupCodesFailed'));
				}
				return;
			}

			if (result.data?.backupCodes) {
				backupCodes = result.data.backupCodes;
				showBackupCodes = true;
				password = '';
				toast.success(t('settings.security.2fa.backupCodesGenerated'));
			}
		} catch (error: any) {
			toast.error(error.message || t('settings.security.2fa.errors.backupCodesFailed'));
		} finally {
			isLoading = false;
		}
	};

	const copyBackupCodes = () => {
		navigator.clipboard.writeText(backupCodes.join('\n'));
		toast.success(t('settings.security.2fa.backupCodesCopied'));
	};

	const downloadBackupCodes = () => {
		const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'backup-codes.txt';
		a.click();
		URL.revokeObjectURL(url);
		toast.success(t('settings.security.2fa.backupCodesDownloaded'));
	};

	const handleChangePassword = async () => {
		// Validation
		if (!currentPassword) {
			toast.error(t('settings.security.password.errors.currentPasswordRequired'));
			return;
		}

		if (!newPassword) {
			toast.error(t('settings.security.password.errors.newPasswordRequired'));
			return;
		}

		if (newPassword.length < 8) {
			toast.error(t('settings.security.password.errors.passwordTooShort'));
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error(t('settings.security.password.errors.passwordMismatch'));
			return;
		}

		if (currentPassword === newPassword) {
			toast.error(t('settings.security.password.errors.samePassword'));
			return;
		}

		isChangingPassword = true;
		try {
			const result = await authClient.changePassword({
				currentPassword,
				newPassword,
				revokeOtherSessions: false
			});

			// Better-auth changePassword returns { data, error }
			if (result.error) {
				// Fordítsuk le a better-auth hibaüzeneteit
				const errorMessage = result.error.message || '';

				if (errorMessage.includes('Invalid password') || errorMessage.includes('password')) {
					throw new Error(t('settings.security.password.errors.incorrectPassword'));
				}

				throw new Error(t('settings.security.password.errors.changeFailed'));
			}

			toast.success(t('settings.security.password.success'));
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error: any) {
			// Ha már lefordított hibaüzenetet kaptunk, használjuk azt
			const errorMessage = error.message || t('settings.security.password.errors.changeFailed');
			toast.error(errorMessage);
		} finally {
			isChangingPassword = false;
		}
	};
</script>

<h2>{t('settings.security.title')}</h2>
<ContentSection
	title={t('settings.security.2fa.title')}
	description={t('settings.security.2fa.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.security.2fa.info')}
	{/snippet}

	{#if session?.user?.twoFactorEnabled}
		<span class="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
			<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
					clip-rule="evenodd"
				/>
			</svg>
			{t('settings.security.2fa.enabled')}
		</span>
	{:else}
		<span class="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
			<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
					clip-rule="evenodd"
				/>
			</svg>
			{t('settings.security.2fa.disabled')}
		</span>
	{/if}

	<!-- Enable 2FA -->
	{#if !session?.user?.twoFactorEnabled && !showSetup}
		<div class="mt-4 space-y-3">
			<div class="grid gap-2">
				<Label for="enable-password">{t('settings.security.2fa.passwordLabel')}</Label>
				<Input
					id="enable-password"
					type="password"
					bind:value={password}
					placeholder={t('settings.security.2fa.passwordPlaceholder')}
				/>
			</div>
			<Button onclick={handleEnable2FA} disabled={isLoading}>
				{isLoading ? t('common.loading') : t('settings.security.2fa.enable')}
			</Button>
		</div>
	{/if}

	<!-- Setup 2FA -->
	{#if showSetup}
		<div class="mt-4 space-y-4">
			<div class="bg-muted rounded-lg p-4">
				<p class="mb-3 text-sm font-medium">{t('settings.security.2fa.scanQR')}</p>
				{#if qrCodeUri}
					<div class="flex justify-center">
						<img
							src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUri)}`}
							alt="QR Code"
							class="rounded-lg"
						/>
					</div>
					<p class="text-muted-foreground mt-3 text-xs">
						{t('settings.security.2fa.manualEntry')}:
						<code class="bg-background rounded px-1"
							>{qrCodeUri.split('secret=')[1]?.split('&')[0]}</code
						>
					</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="verification-code">{t('settings.security.2fa.verificationCode')}</Label>
				<Input
					id="verification-code"
					type="text"
					bind:value={verificationCode}
					placeholder="000000"
					maxlength={6}
				/>
			</div>

			<div class="flex gap-2">
				<Button onclick={handleVerifyAndComplete} disabled={isLoading}>
					{isLoading ? t('common.loading') : t('settings.security.2fa.verify')}
				</Button>
				<Button variant="outline" onclick={() => (showSetup = false)}>
					{t('common.buttons.cancel')}
				</Button>
			</div>
		</div>
	{/if}

	<!-- Disable 2FA -->
	{#if session?.user?.twoFactorEnabled}
		<div class="mt-4 space-y-3">
			<div class="grid gap-2">
				<Label for="disable-password">{t('settings.security.2fa.passwordLabel')}</Label>
				<Input
					id="disable-password"
					type="password"
					bind:value={password}
					placeholder={t('settings.security.2fa.passwordPlaceholder')}
				/>
			</div>
			<div class="flex gap-2">
				<Button variant="destructive" onclick={handleDisable2FA} disabled={isLoading}>
					{isLoading ? t('common.loading') : t('settings.security.2fa.disable')}
				</Button>
				<Button variant="outline" onclick={handleGenerateBackupCodes} disabled={isLoading}>
					{t('settings.security.2fa.regenerateBackupCodes')}
				</Button>
			</div>
		</div>
	{/if}

	<!-- Backup Codes -->
	{#if showBackupCodes && backupCodes.length > 0}
		<div
			class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950"
		>
			<h3 class="font-medium text-yellow-900 dark:text-yellow-100">
				{t('settings.security.2fa.backupCodesTitle')}
			</h3>
			<p class="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
				{t('settings.security.2fa.backupCodesWarning')}
			</p>
			<div
				class="mt-3 grid grid-cols-2 gap-2 rounded bg-white p-3 font-mono text-sm dark:bg-gray-900"
			>
				{#each backupCodes as code}
					<div>{code}</div>
				{/each}
			</div>
			<div class="mt-3 flex gap-2">
				<Button size="sm" variant="outline" onclick={copyBackupCodes}>
					{t('settings.security.2fa.copyBackupCodes')}
				</Button>
				<Button size="sm" variant="outline" onclick={downloadBackupCodes}>
					{t('settings.security.2fa.downloadBackupCodes')}
				</Button>
				<Button size="sm" variant="ghost" onclick={() => (showBackupCodes = false)}>
					{t('common.buttons.close')}
				</Button>
			</div>
		</div>
	{/if}
</ContentSection>

<!-- Password Change Section -->
<ContentSection
	title={t('settings.security.password.title')}
	description={t('settings.security.password.description')}
	contentPosition="bottom"
>
	{#snippet info()}
		{t('settings.security.password.info')}
	{/snippet}

	<div class="mt-4 space-y-3">
		<div class="grid gap-2">
			<Label for="current-password">{t('settings.security.password.currentPasswordLabel')}</Label>
			<Input
				id="current-password"
				type="password"
				bind:value={currentPassword}
				placeholder={t('settings.security.password.currentPasswordPlaceholder')}
				autocomplete="current-password"
			/>
		</div>

		<div class="grid gap-2">
			<Label for="new-password">{t('settings.security.password.newPasswordLabel')}</Label>
			<Input
				id="new-password"
				type="password"
				bind:value={newPassword}
				placeholder={t('settings.security.password.newPasswordPlaceholder')}
				autocomplete="new-password"
			/>
			<p class="text-muted-foreground text-xs">
				{t('settings.security.password.passwordRequirements')}
			</p>
		</div>

		<div class="grid gap-2">
			<Label for="confirm-password">{t('settings.security.password.confirmPasswordLabel')}</Label>
			<Input
				id="confirm-password"
				type="password"
				bind:value={confirmPassword}
				placeholder={t('settings.security.password.confirmPasswordPlaceholder')}
				autocomplete="new-password"
			/>
		</div>

		<Button onclick={handleChangePassword} disabled={isChangingPassword}>
			{isChangingPassword ? t('common.loading') : t('settings.security.password.changeButton')}
		</Button>
	</div>
</ContentSection>
