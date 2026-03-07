<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { AlertTriangle } from 'lucide-svelte';
	import { getNotificationStore } from '$lib/stores/notificationStore.svelte';
	import { getTranslationStore } from '$lib/i18n/store.svelte';

	const notificationStore = getNotificationStore();
	const i18nStore = getTranslationStore();

	const currentLocale = $derived(i18nStore.currentLocale || 'hu');
	const notification = $derived(notificationStore.currentCritical);
	const isOpen = $derived(!!notification);

	function getLocalizedText(content: unknown): string {
		if (typeof content === 'string') return content;
		if (content && typeof content === 'object') {
			const obj = content as Record<string, string>;
			return obj[currentLocale] || obj['hu'] || obj['en'] || Object.values(obj)[0] || '';
		}
		return '';
	}

	function handleAcknowledge() {
		notificationStore.acknowledgeCritical();
	}

	const title = $derived(notification ? getLocalizedText(notification.title) : '');
	const message = $derived(notification ? getLocalizedText(notification.message) : '');
	const details = $derived(notification?.details ? getLocalizedText(notification.details) : null);
</script>

<AlertDialog.Root open={isOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title class="flex items-center gap-2">
				<AlertTriangle class="size-5 text-red-600 dark:text-red-400" />
				{title}
			</AlertDialog.Title>
			<AlertDialog.Description>
				{message}
			</AlertDialog.Description>
			{#if details}
				<p class="text-muted-foreground mt-2 text-sm">{details}</p>
			{/if}
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Action
				class={buttonVariants({ variant: 'destructive' })}
				onclick={handleAcknowledge}
			>
				OK
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
