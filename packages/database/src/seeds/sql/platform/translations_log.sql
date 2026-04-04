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

-- Hiba napló - műveletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'error.actions.open', 'Részletek'),
('hu', 'log', 'error.actions.delete', 'Törlés')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Hiba napló - részletek nézet
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'error.detail.title', 'Napló bejegyzés részletei'),
('hu', 'log', 'error.detail.error', 'Nem sikerült betölteni a napló bejegyzést'),
('hu', 'log', 'error.detail.method', 'HTTP metódus'),
('hu', 'log', 'error.detail.routeId', 'Útvonal'),
('hu', 'log', 'error.detail.userId', 'Felhasználó ID'),
('hu', 'log', 'error.detail.userAgent', 'User Agent'),
('hu', 'log', 'error.detail.stack', 'Stack trace'),
('hu', 'log', 'error.detail.context', 'Kontextus'),
('hu', 'log', 'error.detail.deleteTitle', 'Napló bejegyzés törlése'),
('hu', 'log', 'error.detail.deleteDescription', 'Biztosan törölni szeretnéd ezt a napló bejegyzést? Ez a művelet nem vonható vissza.'),
('hu', 'log', 'error.detail.deleteConfirm', 'Törlés'),
('hu', 'log', 'error.detail.deleteSuccess', 'Napló bejegyzés sikeresen törölve'),
('hu', 'log', 'error.detail.deleteError', 'Nem sikerült törölni a napló bejegyzést')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Aktivitás panel (ActivityLog.svelte)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'log', 'activity.title', 'Aktivitás napló'),
('hu', 'log', 'activity.columns.action', 'Művelet'),
('hu', 'log', 'activity.columns.userId', 'Felhasználó'),
('hu', 'log', 'activity.columns.resource', 'Erőforrás'),
('hu', 'log', 'activity.columns.createdAt', 'Időpont'),
('hu', 'log', 'activity.filters.userIdPlaceholder', 'Felhasználó szűrése...'),
('hu', 'log', 'activity.filters.actionKeyPlaceholder', 'Művelet szűrése...'),
('hu', 'log', 'activity.loadError', 'Nem sikerült betölteni az aktivitás naplót')
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

-- Error log - actions
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'error.actions.open', 'Details'),
('en', 'log', 'error.actions.delete', 'Delete')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Error log - detail view
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'error.detail.title', 'Log entry details'),
('en', 'log', 'error.detail.error', 'Failed to load log entry'),
('en', 'log', 'error.detail.method', 'HTTP method'),
('en', 'log', 'error.detail.routeId', 'Route'),
('en', 'log', 'error.detail.userId', 'User ID'),
('en', 'log', 'error.detail.userAgent', 'User Agent'),
('en', 'log', 'error.detail.stack', 'Stack trace'),
('en', 'log', 'error.detail.context', 'Context'),
('en', 'log', 'error.detail.deleteTitle', 'Delete log entry'),
('en', 'log', 'error.detail.deleteDescription', 'Are you sure you want to delete this log entry? This action cannot be undone.'),
('en', 'log', 'error.detail.deleteConfirm', 'Delete'),
('en', 'log', 'error.detail.deleteSuccess', 'Log entry deleted successfully'),
('en', 'log', 'error.detail.deleteError', 'Failed to delete log entry')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Activity panel (ActivityLog.svelte)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'log', 'activity.title', 'Activity log'),
('en', 'log', 'activity.columns.action', 'Action'),
('en', 'log', 'activity.columns.userId', 'User'),
('en', 'log', 'activity.columns.resource', 'Resource'),
('en', 'log', 'activity.columns.createdAt', 'Timestamp'),
('en', 'log', 'activity.filters.userIdPlaceholder', 'Filter by user...'),
('en', 'log', 'activity.filters.actionKeyPlaceholder', 'Filter by action...'),
('en', 'log', 'activity.loadError', 'Failed to load activity log')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
