<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import { FileUploader } from '$lib/components/file-uploader';
	import { useI18n } from '$lib/i18n/hooks';
	import { authClient } from '$lib/auth/client';
	import { toast } from 'svelte-sonner';
	import { getProfile, updateProfile } from '../profile.remote';
	import { getDisplayedAvatar } from '../utils/avatar-helpers';
	import { validateName, validateUsername } from '../utils/profile-validation';
	import { getActionBar } from '$lib/apps/actionBar.svelte';
	import type { ProfileData } from '$lib/server/database/repositories';
	import type { UploadResult } from '$lib/components/file-uploader';
	import { ButtonSave, ButtonEdit, ButtonCancel } from '$lib/components/shared/buttons';

	// i18n
	const { t, locale } = useI18n();

	// Auth session
	const session = authClient.useSession();

	// Action bar
	const actionBar = getActionBar();

	// ============================================================================
	// State
	// ============================================================================

	let profile = $state<
		| (ProfileData & {
				groups: Array<{
					id: number;
					name: string | Record<string, string>;
					description: string | Record<string, string> | null;
				}>;
				roles: Array<{
					id: number;
					name: string | Record<string, string>;
					description: string | Record<string, string> | null;
				}>;
		  })
		| null
	>(null);
	let isLoadingProfile = $state(true);
	let isSaving = $state(false);
	let editing = $state(false);

	// Form state
	let formName = $state('');
	let formUsername = $state('');
	let formImage = $state<string | null>(null);

	// Validation errors
	let nameError = $state<string | undefined>(undefined);
	let usernameError = $state<string | undefined>(undefined);

	// ============================================================================
	// Derived
	// ============================================================================

	const displayedAvatar = $derived(
		profile
			? getDisplayedAvatar({
					...profile,
					name: editing ? formName : profile.name,
					image: editing ? formImage : profile.image
				})
			: null
	);

	// ============================================================================
	// Effects
	// ============================================================================

	// Load profile data on mount
	let hasLoadedProfile = $state(false);

	$effect(() => {
		if ($session.data?.user?.id && !hasLoadedProfile) {
			hasLoadedProfile = true;
			loadProfile();
		}
	});

	// ============================================================================
	// Functions
	// ============================================================================

	async function loadProfile() {
		isLoadingProfile = true;
		try {
			const result = await getProfile({});
			if (result.success && result.profile) {
				profile = result.profile;
				formName = result.profile.name;
				formUsername = result.profile.username || '';
				formImage = result.profile.image;
				// Set action bar only if not in editing mode
				if (!editing) {
					actionBar.set(viewActions);
				}
			} else {
				toast.error(result.error || t('settings.profile.error'));
			}
		} catch (error) {
			console.error('Failed to load profile:', error);
			toast.error(t('settings.profile.error'));
		} finally {
			isLoadingProfile = false;
		}
	}

	function startEditing() {
		if (!profile) return;
		formName = profile.name;
		formUsername = profile.username || '';
		formImage = profile.image;
		editing = true;
		actionBar.set(editingActions);
	}

	function cancelEditing() {
		if (!profile) return;
		formName = profile.name;
		formUsername = profile.username || '';
		formImage = profile.image;
		nameError = undefined;
		usernameError = undefined;
		editing = false;
		actionBar.set(viewActions);
	}

	async function handleSave() {
		// Validate fields
		const nameValidation = validateName(formName);
		const usernameValidation = validateUsername(formUsername);

		nameError = nameValidation.valid ? undefined : nameValidation.error;
		usernameError = usernameValidation.valid ? undefined : usernameValidation.error;

		if (!nameValidation.valid || !usernameValidation.valid) {
			return;
		}

		isSaving = true;
		try {
			const result = await updateProfile({
				name: formName,
				username: formUsername || null,
				image: formImage
			});

			if (result.success && result.user) {
				// Update local profile state
				if (profile) {
					profile = {
						...profile,
						name: result.user.name,
						username: result.user.username,
						image: result.user.image
					};
				}
				// Refresh session to update user data in start menu
				await $session.refetch();
				toast.success(t('settings.profile.saved'));
				editing = false;
				actionBar.set(viewActions);
			} else {
				toast.error(result.error || t('settings.profile.error'));
			}
		} catch (error) {
			console.error('Failed to save profile:', error);
			toast.error(t('settings.profile.error'));
		} finally {
			isSaving = false;
		}
	}

	async function handleAvatarUpload(result: UploadResult) {
		if (result.success && result.file) {
			formImage = result.file.url;
		}
	}

	function handleResetAvatar() {
		formImage = null;
	}
</script>

{#snippet viewActions()}
	<ButtonEdit text={t('common.buttons.edit')} onclick={startEditing} />
{/snippet}

{#snippet editingActions()}
	<ButtonCancel text={t('common.buttons.cancel')} onclick={cancelEditing} disabled={isSaving} />
	<ButtonSave
		text={isSaving ? t('settings.profile.saving') : t('common.buttons.save')}
		onclick={handleSave}
	/>
{/snippet}

<h2>{t('settings.profile.title')}</h2>

{#if isLoadingProfile}
	<div class="flex items-center justify-center py-8">
		<p class="text-muted-foreground">{t('common.status.loading')}</p>
	</div>
{:else if profile}
	<!-- Avatar Section -->
	<ContentSection
		title={t('settings.profile.avatar.title')}
		description={t('settings.profile.avatar.description')}
		contentPosition="bottom"
	>
		<div class="flex flex-row items-center gap-4">
			<!-- Avatar Display - Centered -->
			<div class="flex flex-col items-center gap-2">
				<Avatar.Root class="h-32 w-32">
					<Avatar.Image src={displayedAvatar?.url || ''} alt={profile.name} />
					<Avatar.Fallback class="text-3xl">
						{displayedAvatar?.initials || '?'}
					</Avatar.Fallback>
				</Avatar.Root>

				{#if displayedAvatar?.type === 'oauth' && profile.oauthProvider}
					<p class="text-muted-foreground text-center text-xs">
						{t('settings.profile.avatar.syncedFrom', { provider: profile.oauthProvider })}
					</p>
				{/if}
			</div>

			<!-- Avatar Upload Controls - Only in editing mode -->
			{#if editing}
				<div class="w-full max-w-md">
					<FileUploader
						mode="instant"
						category="avatars"
						scope="user"
						maxFiles={1}
						fileType="image"
						maxFileSize={5 * 1024 * 1024}
						generateThumbnail={true}
						showInstructions={false}
						onUploadStart={() => (isSaving = true)}
						onUploadComplete={handleAvatarUpload}
						onError={() => (isSaving = false)}
					/>

					{#if formImage && formImage !== profile.oauthImage}
						<div class="mt-3 flex justify-center">
							<Button variant="outline" size="sm" onclick={handleResetAvatar} disabled={isSaving}>
								{t('settings.profile.avatar.reset')}
							</Button>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</ContentSection>

	<!-- Profile Information Section -->
	<ContentSection
		title={t('settings.profile.info.title')}
		description={t('settings.profile.info.description')}
		contentPosition="bottom"
	>
		<div class="w-full space-y-6">
			<!-- Name Field -->
			<div class="grid grid-cols-3 items-start gap-4">
				<Label for="profile-name" class="text-muted-foreground font-normal">
					{t('settings.profile.name.label')}
				</Label>
				<div class="col-span-2">
					{#if editing}
						<Input
							id="profile-name"
							type="text"
							bind:value={formName}
							placeholder={t('settings.profile.name.placeholder')}
							disabled={isSaving}
							class={nameError ? 'border-destructive' : ''}
						/>
						{#if nameError}
							<p class="text-destructive mt-1 text-sm">{nameError}</p>
						{/if}
					{:else}
						<p class="text-foreground font-medium">{profile.name}</p>
					{/if}
				</div>
			</div>

			<!-- Email Field (Read-only) -->
			<div class="grid grid-cols-3 items-start gap-4">
				<Label for="profile-email" class="text-muted-foreground font-normal">
					{t('settings.profile.email.label')}
				</Label>
				<p class="text-foreground col-span-2 font-medium">{profile.email}</p>
			</div>

			<!-- Account Type -->
			<div class="grid grid-cols-3 items-start gap-4">
				<Label class="text-muted-foreground font-normal">
					{t('settings.profile.accountType.label')}
				</Label>
				<div class="col-span-2 flex items-center gap-2">
					{#if profile.oauthProvider}
						<Badge>
							{t(`settings.profile.accountType.${profile.oauthProvider}`)}
						</Badge>
					{:else}
						<Badge>
							{t('settings.profile.accountType.email')}
						</Badge>
					{/if}
				</div>
			</div>

			<!-- Groups -->
			{#if profile.groups && profile.groups.length > 0}
				<div class="grid grid-cols-3 items-start gap-4">
					<Label class="text-muted-foreground font-normal">
						{t('settings.profile.groups.label')}
					</Label>
					<div class="col-span-2 flex flex-wrap gap-2">
						{#each profile.groups as group}
							{@const groupName =
								typeof group.name === 'object' ? group.name[locale] || '' : group.name}
							{@const groupDesc =
								group.description && typeof group.description === 'object'
									? group.description[locale] || undefined
									: group.description || undefined}
							<Badge title={groupDesc}>
								{groupName}
							</Badge>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Roles -->
			{#if profile.roles && profile.roles.length > 0}
				<div class="grid grid-cols-3 items-start gap-4">
					<Label class="text-muted-foreground font-normal">
						{t('settings.profile.roles.label')}
					</Label>
					<div class="col-span-2 flex flex-wrap gap-2">
						{#each profile.roles as role}
							{@const roleName =
								typeof role.name === 'object' ? role.name[locale] || '' : role.name}
							{@const roleDesc =
								role.description && typeof role.description === 'object'
									? role.description[locale] || undefined
									: role.description || undefined}
							<Badge title={roleDesc}>
								{roleName}
							</Badge>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Created At -->
			<div class="grid grid-cols-3 items-start gap-4">
				<Label class="text-muted-foreground font-normal">
					{t('settings.profile.createdAt.label')}
				</Label>
				<p class="text-muted-foreground col-span-2 text-sm">
					{new Date(profile.createdAt).toLocaleDateString()}
				</p>
			</div>
		</div>
	</ContentSection>
{/if}
