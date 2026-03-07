-- =============================================================================
-- LOG NAMESPACE - Napló alkalmazás fordításai
-- =============================================================================
-- Ez a namespace tartalmazza a Log app összes szövegét.
-- Szekciók: menu, error (list, columns, table, filters), activity
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MAGYAR (hu) fordítások
-- -----------------------------------------------------------------------------

-- Log app menü elemek (menu.json labelKey alapján)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'menu.error', 'Hiba'),
('hu', 'log', 'menu.activity', 'Aktivitás')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Hiba panel (ErrorLog.svelte)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'error.title', 'Hiba napló'),
('hu', 'log', 'error.list.label', 'Naplózott hibák'),
('hu', 'log', 'error.list.description', 'A rendszerben naplózott hibák listája')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Hiba napló - oszlopfejlécek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'error.columns.level', 'Szint'),
('hu', 'log', 'error.columns.message', 'Üzenet'),
('hu', 'log', 'error.columns.source', 'Forrás'),
('hu', 'log', 'error.columns.timestamp', 'Időpont'),
('hu', 'log', 'error.columns.url', 'URL')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Hiba napló - szűrők
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'error.filters.allLevels', 'Összes szint'),
('hu', 'log', 'error.filters.sourcePlaceholder', 'Forrás szűrése...'),
('hu', 'log', 'error.filters.reset', 'Visszaállítás')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Aktivitás panel (ActivityLog.svelte)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'activity.title', 'Aktivitás napló')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- ANGOL (en) fordítások
-- -----------------------------------------------------------------------------

-- Log app menü elemek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'menu.error', 'Error'),
('en', 'log', 'menu.activity', 'Activity')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Error panel (ErrorLog.svelte)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'error.title', 'Error log'),
('en', 'log', 'error.list.label', 'Logged errors'),
('en', 'log', 'error.list.description', 'List of errors logged in the system')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Error log - column headers
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'error.columns.level', 'Level'),
('en', 'log', 'error.columns.message', 'Message'),
('en', 'log', 'error.columns.source', 'Source'),
('en', 'log', 'error.columns.timestamp', 'Timestamp'),
('en', 'log', 'error.columns.url', 'URL')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Error log - filters
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'error.filters.allLevels', 'All levels'),
('en', 'log', 'error.filters.sourcePlaceholder', 'Filter by source...'),
('en', 'log', 'error.filters.reset', 'Reset')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Activity panel (ActivityLog.svelte)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'activity.title', 'Activity log')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
