<script lang="ts">
	import { getTranslationStore } from '../store.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import {
		TriangleAlert,
		X,
		Copy,
		Check,
		Database,
		Pencil,
		ChevronDown,
		ChevronRight
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';

	// Csak development módban működik
	const isDev = import.meta.env.DEV;

	const store = getTranslationStore();

	// Reaktív hiányzó és placeholder kulcsok
	let missingKeys = $derived(store.getMissingKeys());
	let placeholderKeys = $derived(store.getPlaceholderKeys());
	let totalIssues = $derived(missingKeys.length + placeholderKeys.length);
	let hasIssues = $derived(totalIssues > 0);

	// Locale szerint csoportosított kulcsok
	type GroupedKeys = Record<string, Array<{ key: string; locale: string; timestamp: number }>>;

	let missingByLocale = $derived(
		missingKeys.reduce<GroupedKeys>((acc, item) => {
			if (!acc[item.locale]) acc[item.locale] = [];
			acc[item.locale].push(item);
			return acc;
		}, {})
	);

	let placeholderByLocale = $derived(
		placeholderKeys.reduce<GroupedKeys>((acc, item) => {
			if (!acc[item.locale]) acc[item.locale] = [];
			acc[item.locale].push(item);
			return acc;
		}, {})
	);

	// Összes érintett locale
	let affectedLocales = $derived(
		[...new Set([...Object.keys(missingByLocale), ...Object.keys(placeholderByLocale)])].sort()
	);

	// Popover állapot
	let isOpen = $state(false);

	// SQL mód kapcsoló
	let sqlMode = $state(true);

	// Másolás állapot
	let copiedKey = $state<string | null>(null);

	// Locale szekciók nyitott állapota
	let expandedLocales = $state<Set<string>>(new Set());
	let initialized = $state(false);

	// Első rendereléskor nyissuk ki az összes locale-t
	$effect(() => {
		if (!initialized && affectedLocales.length > 0) {
			expandedLocales = new Set(affectedLocales);
			initialized = true;
		}
	});

	// Locale szekció ki/becsukása
	function toggleLocale(locale: string) {
		const newSet = new Set(expandedLocales);
		if (newSet.has(locale)) {
			newSet.delete(locale);
		} else {
			newSet.add(locale);
		}
		expandedLocales = newSet;
	}

	// Locale név lekérése
	function getLocaleName(localeCode: string): string {
		const config = store.supportedLocales.find((l) => l.code === localeCode);
		return config?.nativeName || localeCode.toUpperCase();
	}

	// Namespace kinyerése a kulcsból (első pont előtti rész)
	function extractNamespace(key: string): string {
		const dotIndex = key.indexOf('.');
		return dotIndex > 0 ? key.substring(0, dotIndex) : 'common';
	}

	// Kulcs kinyerése namespace nélkül (első pont utáni rész)
	function extractKeyWithoutNamespace(key: string): string {
		const dotIndex = key.indexOf('.');
		return dotIndex > 0 ? key.substring(dotIndex + 1) : key;
	}

	// SQL INSERT generálása egy kulcshoz (hiányzó)
	function generateSqlInsert(key: string, locale: string): string {
		const namespace = extractNamespace(key);
		const keyWithoutNs = extractKeyWithoutNamespace(key);
		return `INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('${locale}', '${namespace}', '${keyWithoutNs}', '*****')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`;
	}

	// SQL UPDATE generálása egy kulcshoz (placeholder)
	function generateSqlUpdate(key: string, locale: string): string {
		const namespace = extractNamespace(key);
		const keyWithoutNs = extractKeyWithoutNamespace(key);
		return `UPDATE platform.translations SET value = '*****', updated_at = NOW()
WHERE locale = '${locale}' AND namespace = '${namespace}' AND key = '${keyWithoutNs}';`;
	}

	// SQL INSERT generálása több kulcshoz (hiányzó)
	function generateSqlInsertBatch(keys: Array<{ key: string; locale: string }>): string {
		// Csoportosítás namespace szerint
		const grouped = keys.reduce(
			(acc, { key, locale }) => {
				const namespace = extractNamespace(key);
				const groupKey = `${locale}:${namespace}`;
				if (!acc[groupKey]) {
					acc[groupKey] = { locale, namespace, keys: [] };
				}
				acc[groupKey].keys.push(key);
				return acc;
			},
			{} as Record<string, { locale: string; namespace: string; keys: string[] }>
		);

		const statements: string[] = [];

		for (const { locale, namespace, keys: groupKeys } of Object.values(grouped)) {
			const values = groupKeys
				.map((key) => {
					const keyWithoutNs = extractKeyWithoutNamespace(key);
					return `('${locale}', '${namespace}', '${keyWithoutNs}', '*****')`;
				})
				.join(',\n');

			statements.push(
				`-- ${namespace} namespace (${locale}) - INSERT\nINSERT INTO platform.translations (locale, namespace, key, value) VALUES\n${values}\nON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`
			);
		}

		return statements.join('\n\n');
	}

	// SQL UPDATE generálása több kulcshoz (placeholder)
	function generateSqlUpdateBatch(keys: Array<{ key: string; locale: string }>): string {
		// Csoportosítás namespace szerint
		const grouped = keys.reduce(
			(acc, { key, locale }) => {
				const namespace = extractNamespace(key);
				const groupKey = `${locale}:${namespace}`;
				if (!acc[groupKey]) {
					acc[groupKey] = { locale, namespace, keys: [] };
				}
				acc[groupKey].keys.push(key);
				return acc;
			},
			{} as Record<string, { locale: string; namespace: string; keys: string[] }>
		);

		const statements: string[] = [];

		for (const { locale, namespace, keys: groupKeys } of Object.values(grouped)) {
			const updates = groupKeys
				.map((key) => {
					const keyWithoutNs = extractKeyWithoutNamespace(key);
					return `UPDATE platform.translations SET value = '*****', updated_at = NOW() WHERE locale = '${locale}' AND namespace = '${namespace}' AND key = '${keyWithoutNs}';`;
				})
				.join('\n');

			statements.push(`-- ${namespace} namespace (${locale}) - UPDATE\n${updates}`);
		}

		return statements.join('\n\n');
	}

	// Kulcs másolása vágólapra (hiányzó)
	async function copyMissingKey(key: string, locale: string) {
		try {
			const textToCopy = sqlMode ? generateSqlInsert(key, locale) : key;
			await navigator.clipboard.writeText(textToCopy);
			copiedKey = `missing:${key}:${locale}`;
			setTimeout(() => {
				copiedKey = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	// Kulcs másolása vágólapra (placeholder)
	async function copyPlaceholderKey(key: string, locale: string) {
		try {
			const textToCopy = sqlMode ? generateSqlUpdate(key, locale) : key;
			await navigator.clipboard.writeText(textToCopy);
			copiedKey = `placeholder:${key}:${locale}`;
			setTimeout(() => {
				copiedKey = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	// Összes hiányzó kulcs másolása egy locale-hoz
	async function copyAllMissingKeysForLocale(locale: string) {
		try {
			const keys = missingByLocale[locale] || [];
			const textToCopy = sqlMode ? generateSqlInsertBatch(keys) : keys.map((m) => m.key).join('\n');
			await navigator.clipboard.writeText(textToCopy);
			copiedKey = `__all_missing_${locale}__`;
			setTimeout(() => {
				copiedKey = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	// Összes placeholder kulcs másolása egy locale-hoz
	async function copyAllPlaceholderKeysForLocale(locale: string) {
		try {
			const keys = placeholderByLocale[locale] || [];
			const textToCopy = sqlMode ? generateSqlUpdateBatch(keys) : keys.map((m) => m.key).join('\n');
			await navigator.clipboard.writeText(textToCopy);
			copiedKey = `__all_placeholder_${locale}__`;
			setTimeout(() => {
				copiedKey = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
</script>

{#if isDev && hasIssues}
	<div class="i18n-devtools">
		<Popover.Root bind:open={isOpen}>
			<Popover.Trigger>
				<button class="devtools-trigger">
					<span class="devtools-trigger_title">Felirat problémák:</span>
					{#if missingKeys.length > 0}
						<span class="trigger-item error">
							<X size={12} />
							<span>{missingKeys.length}</span>
						</span>
					{/if}
					{#if placeholderKeys.length > 0}
						<span class="trigger-item warning">
							<TriangleAlert size={12} />
							<span>{placeholderKeys.length}</span>
						</span>
					{/if}
				</button>
			</Popover.Trigger>
			<Popover.Content class="devtools-popover" side="bottom" align="start" sideOffset={8}>
				<div class="popover-header">
					<div></div>
					<div class="header-actions">
						<Button variant="ghost" size="sm" onclick={() => (isOpen = false)}>
							<X size={14} />
						</Button>
					</div>
				</div>

				<div class="popover-info">
					<span class="count">{totalIssues} probléma</span>
					<span class="locale-list">
						{#each affectedLocales as locale, i}
							{#if i > 0}<span class="locale-sep">•</span>{/if}
							<span class="locale-tag">{locale.toUpperCase()}</span>
						{/each}
					</span>
					<div class="sql-toggle">
						<Database size={12} class={sqlMode ? 'text-primary' : 'text-muted-foreground'} />
						<Switch
							checked={sqlMode}
							onCheckedChange={(checked) => (sqlMode = checked)}
							class="sql-switch"
						/>
						<span class="toggle-label" class:active={sqlMode}>SQL</span>
					</div>
				</div>

				<div class="keys-list">
					{#each affectedLocales as locale (locale)}
						{@const localeMissing = missingByLocale[locale] || []}
						{@const localePlaceholder = placeholderByLocale[locale] || []}
						{@const localeTotal = localeMissing.length + localePlaceholder.length}
						{@const isExpanded = expandedLocales.has(locale)}

						{#if localeTotal > 0}
							<div class="locale-section">
								<button type="button" class="locale-header" onclick={() => toggleLocale(locale)}>
									<span class="collapse-icon">
										{#if isExpanded}
											<ChevronDown size={14} />
										{:else}
											<ChevronRight size={14} />
										{/if}
									</span>
									<span class="locale-badge">{getLocaleName(locale)}</span>
									<span class="locale-count">{localeTotal} probléma</span>
								</button>

								{#if isExpanded}
									<div class="locale-content">
										{#if localeMissing.length > 0}
											<div class="section-header">
												<span class="section-title missing">Hiányzó ({localeMissing.length})</span>
												<Button
													variant="ghost"
													size="sm"
													onclick={() => copyAllMissingKeysForLocale(locale)}
													title={sqlMode ? 'INSERT SQL másolása' : 'Összes másolása'}
												>
													{#if copiedKey === `__all_missing_${locale}__`}
														<Check size={12} />
													{:else}
														<Copy size={12} />
													{/if}
												</Button>
											</div>
											{#each localeMissing as { key } (key)}
												<div class="key-item">
													<code class="key-text">{key}</code>
													<button
														class="copy-btn"
														onclick={() => copyMissingKey(key, locale)}
														title={sqlMode ? 'SQL INSERT másolása' : 'Kulcs másolása'}
													>
														{#if copiedKey === `missing:${key}:${locale}`}
															<Check size={12} />
														{:else if sqlMode}
															<Database size={12} />
														{:else}
															<Copy size={12} />
														{/if}
													</button>
												</div>
											{/each}
										{/if}

										{#if localePlaceholder.length > 0}
											<div class="section-header">
												<span class="section-title placeholder"
													>Placeholder ({localePlaceholder.length})</span
												>
												<Button
													variant="ghost"
													size="sm"
													onclick={() => copyAllPlaceholderKeysForLocale(locale)}
													title={sqlMode ? 'UPDATE SQL másolása' : 'Összes másolása'}
												>
													{#if copiedKey === `__all_placeholder_${locale}__`}
														<Check size={12} />
													{:else}
														<Copy size={12} />
													{/if}
												</Button>
											</div>
											{#each localePlaceholder as { key } (key)}
												<div class="key-item">
													<code class="key-text">{key}</code>
													<button
														class="copy-btn"
														onclick={() => copyPlaceholderKey(key, locale)}
														title={sqlMode ? 'SQL UPDATE másolása' : 'Kulcs másolása'}
													>
														{#if copiedKey === `placeholder:${key}:${locale}`}
															<Check size={12} />
														{:else if sqlMode}
															<Pencil size={12} />
														{:else}
															<Copy size={12} />
														{/if}
													</button>
												</div>
											{/each}
										{/if}
									</div>
								{/if}
							</div>
						{/if}
					{/each}
				</div>

				<div class="popover-footer">
					{#if sqlMode}
						<p>Hiányzó: INSERT, Placeholder: UPDATE parancsok. Értékek: *****</p>
					{:else}
						<p>Tipp: Adja hozzá/frissítse ezeket a kulcsokat a fordítási fájlokban.</p>
					{/if}
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>
{/if}

<style>
	.i18n-devtools {
		position: fixed;
		top: 0.75rem;
		left: 0.75rem;
		z-index: 99999;
	}

	.devtools-trigger {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		backdrop-filter: blur(8px);
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.12),
			0 1px 2px rgba(0, 0, 0, 0.08);
		border: 1px solid hsl(var(--border) / 0.5);
		border-radius: 6px;
		background: hsl(var(--background) / 0.8);
		padding: 0.25rem;
	}

	.devtools-trigger:hover {
		transform: translateY(-1px);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.15),
			0 2px 4px rgba(0, 0, 0, 0.1);
		border-color: hsl(var(--border));
		background: hsl(var(--background) / 0.95);
	}

	.devtools-trigger_title {
		margin: 0 5px;
		color: var(--color-stone-500);
		font-size: 0.7rem;
	}

	.trigger-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		border-radius: 4px;
		padding: 0.25rem 0.375rem;
		font-weight: 600;
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
	}

	.trigger-item.error {
		background: rgba(220, 38, 38, 0.15);
		color: #dc2626;
	}

	.trigger-item.warning {
		background: rgba(245, 158, 11, 0.15);
		color: #f59e0b;
	}

	:global(.devtools-popover) {
		padding: 0 !important;
		width: 380px !important;
		max-height: 500px;
		overflow: hidden;
	}

	.popover-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.5);
		padding: 0.75rem 1rem;
	}

	.header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.25rem;
	}

	.popover-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
		padding: 0.5rem 1rem;
	}

	.locale-list {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.locale-tag {
		border-radius: 3px;
		background: hsl(var(--muted));
		padding: 0.125rem 0.375rem;
		color: hsl(var(--muted-foreground));
		font-weight: 500;
		font-size: 0.65rem;
	}

	.locale-sep {
		color: hsl(var(--muted-foreground));
		font-size: 0.5rem;
	}

	.locale-badge {
		border-radius: 4px;
		background: hsl(var(--primary));
		padding: 0.125rem 0.5rem;
		color: hsl(var(--primary-foreground));
		font-weight: 500;
		font-size: 0.75rem;
	}

	.count {
		color: hsl(var(--muted-foreground));
		font-size: 0.75rem;
	}

	.sql-toggle {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-left: auto;
	}

	.sql-toggle :global(.sql-switch) {
		scale: 0.75;
	}

	.toggle-label {
		transition: color 0.15s ease;
		color: hsl(var(--muted-foreground));
		font-weight: 500;
		font-size: 0.65rem;
		text-transform: uppercase;
	}

	.toggle-label.active {
		color: hsl(var(--primary));
	}

	.keys-list {
		padding: 0.5rem;
		max-height: 320px;
		overflow-y: auto;
	}

	.locale-section {
		margin-bottom: 0.75rem;
		border: 1px solid hsl(var(--border));
		border-radius: 8px;
		background: hsl(var(--card));
		overflow: hidden;
	}

	.locale-section:last-child {
		margin-bottom: 0;
	}

	.locale-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.15s ease;
		cursor: pointer;
		border: none;
		border-bottom: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.5);
		padding: 0.5rem 0.75rem;
		width: 100%;
		text-align: left;
	}

	.locale-header:hover {
		background: hsl(var(--muted) / 0.8);
	}

	.collapse-icon {
		display: flex;
		align-items: center;
		color: hsl(var(--muted-foreground));
	}

	.locale-content {
		padding: 0.25rem;
	}

	.locale-count {
		color: hsl(var(--muted-foreground));
		font-size: 0.7rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.5rem;
		margin-bottom: 0.25rem;
		padding: 0.25rem 0.5rem;
	}

	.section-header:first-child {
		margin-top: 0;
	}

	.section-title {
		font-weight: 600;
		font-size: 0.7rem;
		text-transform: uppercase;
	}

	.section-title.missing {
		color: #dc2626;
	}

	.section-title.placeholder {
		color: #f59e0b;
	}

	.key-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.15s ease;
		/*cursor: pointer;*/
		border-radius: 6px;
		padding: 0.375rem 0.5rem;
	}

	.key-item:hover {
		background: oklch(0.7 0.15 250 / 0.2);
	}

	.key-item:hover .copy-btn {
		opacity: 1;
	}

	.key-text {
		flex: 1;
		overflow: hidden;
		color: hsl(var(--foreground));
		font-size: 0.8rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.copy-btn {
		display: flex;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		opacity: 0.5;
		transition: all 0.15s ease;
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background: transparent;
		padding: 0.375rem;
		color: hsl(var(--muted-foreground));
	}

	.copy-btn:hover {
		opacity: 1;
		background: hsl(var(--muted));
		color: hsl(var(--foreground));
	}

	.popover-footer {
		border-top: 1px solid hsl(var(--border));
		background: hsl(var(--muted) / 0.3);
		padding: 0.75rem 1rem;
	}

	.popover-footer p {
		margin: 0;
		color: hsl(var(--muted-foreground));
		font-size: 0.7rem;
	}
</style>
