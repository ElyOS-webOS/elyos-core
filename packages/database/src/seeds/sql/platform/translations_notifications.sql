-- =============================================================================
-- NOTIFICATIONS NAMESPACE - Értesítési rendszer fordításai
-- =============================================================================
-- Ez a namespace tartalmazza az értesítési rendszer szövegeit:
-- NotificationCenter komponens, értesítési műveletek
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MAGYAR (hu) fordítások
-- -----------------------------------------------------------------------------

-- Értesítési központ
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'notifications', 'title', 'Értesítések'),
('hu', 'notifications', 'empty', 'Nincsenek értesítések')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Értesítési műveletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'notifications', 'actions.refresh', 'Frissítés'),
('hu', 'notifications', 'actions.markAllRead', 'Összes olvasva'),
('hu', 'notifications', 'actions.markRead', 'Olvasottá tétel'),
('hu', 'notifications', 'actions.deleteAll', 'Összes törlése'),
('hu', 'notifications', 'actions.delete', 'Törlés'),
('hu', 'notifications', 'actions.close', 'Bezárás'),
('hu', 'notifications', 'actions.viewDetails', 'Részletek')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Értesítési lista
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'notifications', 'list.title', 'Értesítések'),
('hu', 'notifications', 'list.description', 'Az összes értesítésed egy helyen'),
('hu', 'notifications', 'list.columns.type', 'Típus'),
('hu', 'notifications', 'list.columns.title', 'Cím'),
('hu', 'notifications', 'list.columns.message', 'Üzenet'),
('hu', 'notifications', 'list.columns.app', 'Alkalmazás'),
('hu', 'notifications', 'list.columns.createdAt', 'Létrehozva'),
('hu', 'notifications', 'list.actions.open', 'Megnyitás'),
('hu', 'notifications', 'list.actions.markAsRead', 'Olvasottá tétel'),
('hu', 'notifications', 'list.actions.delete', 'Törlés'),
('hu', 'notifications', 'list.deleteSuccess', 'Értesítés sikeresen törölve'),
('hu', 'notifications', 'list.deleteError', 'Hiba történt az értesítés törlésekor'),
('hu', 'notifications', 'list.markReadSuccess', 'Értesítés olvasottá téve'),
('hu', 'notifications', 'list.markReadError', 'Hiba történt az értesítés olvasottá tételekor')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Értesítés részletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'notifications', 'detail.title', 'Értesítés részletei'),
('hu', 'notifications', 'detail.notificationTitle', 'Cím'),
('hu', 'notifications', 'detail.message', 'Üzenet'),
('hu', 'notifications', 'detail.details', 'Részletek'),
('hu', 'notifications', 'detail.type', 'Típus'),
('hu', 'notifications', 'detail.app', 'Alkalmazás'),
('hu', 'notifications', 'detail.status', 'Állapot'),
('hu', 'notifications', 'detail.read', 'Olvasott'),
('hu', 'notifications', 'detail.unread', 'Olvasatlan'),
('hu', 'notifications', 'detail.createdAt', 'Létrehozva'),
('hu', 'notifications', 'detail.readAt', 'Olvasva'),
('hu', 'notifications', 'detail.markAsRead', 'Olvasottá tétel'),
('hu', 'notifications', 'detail.openApp', 'Alkalmazás megnyitása'),
('hu', 'notifications', 'detail.delete', 'Törlés'),
('hu', 'notifications', 'detail.deleteTitle', 'Értesítés törlése'),
('hu', 'notifications', 'detail.deleteDescription', 'Biztosan törölni szeretnéd ezt az értesítést: {title}?'),
('hu', 'notifications', 'detail.deleteConfirm', 'Törlés'),
('hu', 'notifications', 'detail.deleteSuccess', 'Értesítés sikeresen törölve'),
('hu', 'notifications', 'detail.deleteError', 'Hiba történt az értesítés törlésekor'),
('hu', 'notifications', 'detail.markReadSuccess', 'Értesítés olvasottá téve'),
('hu', 'notifications', 'detail.markReadError', 'Hiba történt az értesítés olvasottá tételekor'),
('hu', 'notifications', 'detail.appOpened', 'Alkalmazás megnyitva'),
('hu', 'notifications', 'detail.appOpenError', 'Hiba történt az alkalmazás megnyitásakor'),
('hu', 'notifications', 'detail.notFound', 'Értesítés nem található'),
('hu', 'notifications', 'detail.error', 'Hiba történt az értesítés betöltésekor')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- -----------------------------------------------------------------------------
-- ANGOL (en) fordítások
-- -----------------------------------------------------------------------------

-- Értesítési központ
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'notifications', 'title', 'Notifications'),
('en', 'notifications', 'empty', 'No notifications')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Értesítési műveletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'notifications', 'actions.refresh', 'Refresh'),
('en', 'notifications', 'actions.markAllRead', 'Mark all as read'),
('en', 'notifications', 'actions.markRead', 'Mark as read'),
('en', 'notifications', 'actions.deleteAll', 'Delete all'),
('en', 'notifications', 'actions.delete', 'Delete'),
('en', 'notifications', 'actions.close', 'Close'),
('en', 'notifications', 'actions.viewDetails', 'View details')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Értesítési lista
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'notifications', 'list.title', 'Notifications'),
('en', 'notifications', 'list.description', 'All your notifications in one place'),
('en', 'notifications', 'list.columns.type', 'Type'),
('en', 'notifications', 'list.columns.title', 'Title'),
('en', 'notifications', 'list.columns.message', 'Message'),
('en', 'notifications', 'list.columns.app', 'Application'),
('en', 'notifications', 'list.columns.createdAt', 'Created'),
('en', 'notifications', 'list.actions.open', 'Open'),
('en', 'notifications', 'list.actions.markAsRead', 'Mark as read'),
('en', 'notifications', 'list.actions.delete', 'Delete'),
('en', 'notifications', 'list.deleteSuccess', 'Notification deleted successfully'),
('en', 'notifications', 'list.deleteError', 'Failed to delete notification'),
('en', 'notifications', 'list.markReadSuccess', 'Notification marked as read'),
('en', 'notifications', 'list.markReadError', 'Failed to mark notification as read')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Notification details
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'notifications', 'detail.title', 'Notification Details'),
('en', 'notifications', 'detail.notificationTitle', 'Title'),
('en', 'notifications', 'detail.message', 'Message'),
('en', 'notifications', 'detail.details', 'Details'),
('en', 'notifications', 'detail.type', 'Type'),
('en', 'notifications', 'detail.app', 'Application'),
('en', 'notifications', 'detail.status', 'Status'),
('en', 'notifications', 'detail.read', 'Read'),
('en', 'notifications', 'detail.unread', 'Unread'),
('en', 'notifications', 'detail.createdAt', 'Created'),
('en', 'notifications', 'detail.readAt', 'Read at'),
('en', 'notifications', 'detail.markAsRead', 'Mark as read'),
('en', 'notifications', 'detail.openApp', 'Open application'),
('en', 'notifications', 'detail.delete', 'Delete'),
('en', 'notifications', 'detail.deleteTitle', 'Delete notification'),
('en', 'notifications', 'detail.deleteDescription', 'Are you sure you want to delete this notification: {title}?'),
('en', 'notifications', 'detail.deleteConfirm', 'Delete'),
('en', 'notifications', 'detail.deleteSuccess', 'Notification deleted successfully'),
('en', 'notifications', 'detail.deleteError', 'Failed to delete notification'),
('en', 'notifications', 'detail.markReadSuccess', 'Notification marked as read'),
('en', 'notifications', 'detail.markReadError', 'Failed to mark notification as read'),
('en', 'notifications', 'detail.appOpened', 'Application opened'),
('en', 'notifications', 'detail.appOpenError', 'Failed to open application'),
('en', 'notifications', 'detail.notFound', 'Notification not found'),
('en', 'notifications', 'detail.error', 'Failed to load notification')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
