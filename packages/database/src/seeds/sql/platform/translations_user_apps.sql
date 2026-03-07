-- =============================================================================
-- USER NAMESPACE - App hozzárendelés fordítások
-- =============================================================================
-- Ez a fájl tartalmazza az app hozzárendeléshez szükséges fordításokat
-- csoportokhoz és szerepkörökhöz
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MAGYAR (hu) fordítások
-- -----------------------------------------------------------------------------

-- App oszlopfejlécek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'apps.columns.name', 'App neve'),
('hu', 'users', 'apps.columns.description', 'Leírás'),
('hu', 'users', 'apps.columns.category', 'Kategória')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App műveletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'apps.actions.open', 'Megnyitás')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App megnyitás hibák
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'groups.openApp.error', 'Az alkalmazás megnyitása sikertelen'),
('hu', 'users', 'roles.openApp.error', 'Az alkalmazás megnyitása sikertelen')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Csoport app részletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'groups.detail.apps', 'Alkalmazások')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Csoport app műveletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'groups.actions.removeApp', 'Eltávolítás a csoportból')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App hozzáadása csoporthoz
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'groups.addApp.button', 'Alkalmazás hozzáadása'),
('hu', 'users', 'groups.addApp.title', 'Alkalmazás hozzáadása a csoporthoz'),
('hu', 'users', 'groups.addApp.description', 'Válassz egy alkalmazást, amit hozzá szeretnél adni ehhez a csoporthoz.'),
('hu', 'users', 'groups.addApp.selectLabel', 'Alkalmazás'),
('hu', 'users', 'groups.addApp.selectPlaceholder', 'Válassz alkalmazást...'),
('hu', 'users', 'groups.addApp.searchPlaceholder', 'Keresés...'),
('hu', 'users', 'groups.addApp.noResults', 'Nincs találat.'),
('hu', 'users', 'groups.addApp.confirm', 'Hozzáadás'),
('hu', 'users', 'groups.addApp.success', 'Az alkalmazás sikeresen hozzáadva a csoporthoz'),
('hu', 'users', 'groups.addApp.error', 'Az alkalmazás hozzáadása sikertelen'),
('hu', 'users', 'groups.addApp.loadError', 'Az elérhető alkalmazások betöltése sikertelen')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App eltávolítása csoportból
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'groups.removeApp.title', 'Alkalmazás eltávolítása'),
('hu', 'users', 'groups.removeApp.description', 'Biztosan el szeretnéd távolítani a(z) {name} alkalmazást a csoportból?'),
('hu', 'users', 'groups.removeApp.confirm', 'Eltávolítás'),
('hu', 'users', 'groups.removeApp.cancel', 'Mégse'),
('hu', 'users', 'groups.removeApp.success', 'Az alkalmazás sikeresen eltávolítva a csoportból'),
('hu', 'users', 'groups.removeApp.error', 'Az alkalmazás eltávolítása sikertelen')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Szerepkör app részletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'roles.detail.apps', 'Alkalmazások')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Szerepkör app műveletek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'roles.actions.removeApp', 'Eltávolítás a szerepkörből')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App hozzáadása szerepkörhöz
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'roles.addApp.button', 'Alkalmazás hozzáadása'),
('hu', 'users', 'roles.addApp.title', 'Alkalmazás hozzáadása a szerepkörhöz'),
('hu', 'users', 'roles.addApp.description', 'Válassz egy alkalmazást, amit hozzá szeretnél adni ehhez a szerepkörhöz.'),
('hu', 'users', 'roles.addApp.selectLabel', 'Alkalmazás'),
('hu', 'users', 'roles.addApp.selectPlaceholder', 'Válassz alkalmazást...'),
('hu', 'users', 'roles.addApp.searchPlaceholder', 'Keresés...'),
('hu', 'users', 'roles.addApp.noResults', 'Nincs találat.'),
('hu', 'users', 'roles.addApp.confirm', 'Hozzáadás'),
('hu', 'users', 'roles.addApp.success', 'Az alkalmazás sikeresen hozzáadva a szerepkörhöz'),
('hu', 'users', 'roles.addApp.error', 'Az alkalmazás hozzáadása sikertelen'),
('hu', 'users', 'roles.addApp.loadError', 'Az elérhető alkalmazások betöltése sikertelen')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App eltávolítása szerepkörből
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'roles.removeApp.title', 'Alkalmazás eltávolítása'),
('hu', 'users', 'roles.removeApp.description', 'Biztosan el szeretnéd távolítani a(z) {name} alkalmazást a szerepkörből?'),
('hu', 'users', 'roles.removeApp.confirm', 'Eltávolítás'),
('hu', 'users', 'roles.removeApp.cancel', 'Mégse'),
('hu', 'users', 'roles.removeApp.success', 'Az alkalmazás sikeresen eltávolítva a szerepkörből'),
('hu', 'users', 'roles.removeApp.error', 'Az alkalmazás eltávolítása sikertelen')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Csoport és szerepkör törlés
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'groups.delete.button', 'Csoport törlése'),
('hu', 'users', 'groups.delete.title', 'Csoport törlése'),
('hu', 'users', 'groups.delete.description', 'Biztosan törölni szeretnéd a(z) {name} csoportot? Ez a művelet nem vonható vissza.'),
('hu', 'users', 'groups.delete.confirm', 'Törlés'),
('hu', 'users', 'groups.delete.success', 'A csoport sikeresen törölve'),
('hu', 'users', 'groups.delete.error', 'A csoport törlése sikertelen'),
('hu', 'users', 'roles.delete.button', 'Szerepkör törlése'),
('hu', 'users', 'roles.delete.title', 'Szerepkör törlése'),
('hu', 'users', 'roles.delete.description', 'Biztosan törölni szeretnéd a(z) {name} szerepkört? Ez a művelet nem vonható vissza.'),
('hu', 'users', 'roles.delete.confirm', 'Törlés'),
('hu', 'users', 'roles.delete.success', 'A szerepkör sikeresen törölve'),
('hu', 'users', 'roles.delete.error', 'A szerepkör törlése sikertelen')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Szerkesztés
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'users', 'groups.edit.saveSuccess', 'A változtatások sikeresen mentve'),
('hu', 'users', 'groups.edit.saveError', 'A változtatások mentése sikertelen'),
('hu', 'users', 'roles.edit.saveSuccess', 'A változtatások sikeresen mentve'),
('hu', 'users', 'roles.edit.saveError', 'A változtatások mentése sikertelen')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- ANGOL (en) fordítások
-- -----------------------------------------------------------------------------

-- App column headers
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'apps.columns.name', 'App name'),
('en', 'users', 'apps.columns.description', 'Description'),
('en', 'users', 'apps.columns.category', 'Category')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App actions
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'apps.actions.open', 'Open')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- App open errors
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'groups.openApp.error', 'Failed to open application'),
('en', 'users', 'roles.openApp.error', 'Failed to open application')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Group app details
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'groups.detail.apps', 'Applications')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Group app actions
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'groups.actions.removeApp', 'Remove from group')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Add app to group
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'groups.addApp.button', 'Add Application'),
('en', 'users', 'groups.addApp.title', 'Add Application to Group'),
('en', 'users', 'groups.addApp.description', 'Select an application to add to this group.'),
('en', 'users', 'groups.addApp.selectLabel', 'Application'),
('en', 'users', 'groups.addApp.selectPlaceholder', 'Select application...'),
('en', 'users', 'groups.addApp.searchPlaceholder', 'Search...'),
('en', 'users', 'groups.addApp.noResults', 'No results found.'),
('en', 'users', 'groups.addApp.confirm', 'Add'),
('en', 'users', 'groups.addApp.success', 'Application successfully added to group'),
('en', 'users', 'groups.addApp.error', 'Failed to add application'),
('en', 'users', 'groups.addApp.loadError', 'Failed to load available applications')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Remove app from group
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'groups.removeApp.title', 'Remove Application'),
('en', 'users', 'groups.removeApp.description', 'Are you sure you want to remove the {name} application from this group?'),
('en', 'users', 'groups.removeApp.confirm', 'Remove'),
('en', 'users', 'groups.removeApp.cancel', 'Cancel'),
('en', 'users', 'groups.removeApp.success', 'Application successfully removed from group'),
('en', 'users', 'groups.removeApp.error', 'Failed to remove application')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Role app details
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'roles.detail.apps', 'Applications')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Role app actions
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'roles.actions.removeApp', 'Remove from role')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Add app to role
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'roles.addApp.button', 'Add Application'),
('en', 'users', 'roles.addApp.title', 'Add Application to Role'),
('en', 'users', 'roles.addApp.description', 'Select an application to add to this role.'),
('en', 'users', 'roles.addApp.selectLabel', 'Application'),
('en', 'users', 'roles.addApp.selectPlaceholder', 'Select application...'),
('en', 'users', 'roles.addApp.searchPlaceholder', 'Search...'),
('en', 'users', 'roles.addApp.noResults', 'No results found.'),
('en', 'users', 'roles.addApp.confirm', 'Add'),
('en', 'users', 'roles.addApp.success', 'Application successfully added to role'),
('en', 'users', 'roles.addApp.error', 'Failed to add application'),
('en', 'users', 'roles.addApp.loadError', 'Failed to load available applications')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Remove app from role
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'roles.removeApp.title', 'Remove Application'),
('en', 'users', 'roles.removeApp.description', 'Are you sure you want to remove the {name} application from this role?'),
('en', 'users', 'roles.removeApp.confirm', 'Remove'),
('en', 'users', 'roles.removeApp.cancel', 'Cancel'),
('en', 'users', 'roles.removeApp.success', 'Application successfully removed from role'),
('en', 'users', 'roles.removeApp.error', 'Failed to remove application')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Group and role deletion
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'groups.delete.button', 'Delete Group'),
('en', 'users', 'groups.delete.title', 'Delete Group'),
('en', 'users', 'groups.delete.description', 'Are you sure you want to delete the {name} group? This action cannot be undone.'),
('en', 'users', 'groups.delete.confirm', 'Delete'),
('en', 'users', 'groups.delete.success', 'Group successfully deleted'),
('en', 'users', 'groups.delete.error', 'Failed to delete group'),
('en', 'users', 'roles.delete.button', 'Delete Role'),
('en', 'users', 'roles.delete.title', 'Delete Role'),
('en', 'users', 'roles.delete.description', 'Are you sure you want to delete the {name} role? This action cannot be undone.'),
('en', 'users', 'roles.delete.confirm', 'Delete'),
('en', 'users', 'roles.delete.success', 'Role successfully deleted'),
('en', 'users', 'roles.delete.error', 'Failed to delete role')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Edit
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'users', 'groups.edit.saveSuccess', 'Changes saved successfully'),
('en', 'users', 'groups.edit.saveError', 'Failed to save changes'),
('en', 'users', 'roles.edit.saveSuccess', 'Changes saved successfully'),
('en', 'users', 'roles.edit.saveError', 'Failed to save changes')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
