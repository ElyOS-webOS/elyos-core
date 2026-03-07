<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';

	import { useI18n } from '$lib/i18n/hooks';

	// i18n
	const { t } = useI18n();
</script>

<h2>{t('log.activity.title')}</h2>
