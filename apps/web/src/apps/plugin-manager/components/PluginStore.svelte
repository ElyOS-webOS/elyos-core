<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Store, Package, Download } from 'lucide-svelte/icons';
	import { useI18n } from '$lib/i18n/hooks';

	const { t } = useI18n();
</script>

<div class="title-block">
	<h2>{t('plugin-manager.store.title')}</h2>
	<h3>{t('plugin-manager.store.description')}</h3>
</div>

<div class="mx-auto max-w-4xl">
	<Card.Root class="border-dashed">
		<Card.Content class="flex flex-col items-center justify-center py-16 text-center">
			<div class="bg-primary/10 mb-6 flex size-20 items-center justify-center rounded-full">
				<Store class="text-primary size-10" />
			</div>

			<h3 class="mb-2 text-xl font-semibold">{t('plugin-manager.store.comingSoon')}</h3>
			<p class="text-muted-foreground mb-6 max-w-md">
				{t('plugin-manager.store.comingSoonDescription')}
			</p>

			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2">
					<Package class="text-muted-foreground size-5" />
					<span class="text-muted-foreground text-sm"
						>{t('plugin-manager.store.features.browse')}</span
					>
				</div>
				<div class="flex items-center gap-2">
					<Download class="text-muted-foreground size-5" />
					<span class="text-muted-foreground text-sm"
						>{t('plugin-manager.store.features.install')}</span
					>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
