-- =============================================================================
-- AI-ASSISTANT NAMESPACE - AI Asszisztens fordításai
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MAGYAR (hu) fordítások
-- -----------------------------------------------------------------------------

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'ai-assistant', 'panel.title', 'AI Asszisztens'),
('hu', 'ai-assistant', 'taskbar.label', 'AI Asszisztens'),
('hu', 'ai-assistant', 'emotion.label', 'Érzelem választó'),
('hu', 'ai-assistant', 'history.label', 'Beszélgetési előzmények'),
('hu', 'ai-assistant', 'history.empty', 'Tedd fel az első kérdésedet!'),
('hu', 'ai-assistant', 'loading', 'Válasz betöltése...'),
('hu', 'ai-assistant', 'input.placeholder', 'Mi a helyzet?'),
('hu', 'ai-assistant', 'input.label', 'Kérdés beviteli mező'),
('hu', 'ai-assistant', 'input.send', 'Küldés'),
('hu', 'ai-assistant', 'input.tooLong', 'A kérdés túl hosszú (maximum {max} karakter).')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- ANGOL (en) fordítások
-- -----------------------------------------------------------------------------

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'ai-assistant', 'panel.title', 'AI Assistant'),
('en', 'ai-assistant', 'taskbar.label', 'AI Assistant'),
('en', 'ai-assistant', 'emotion.label', 'Emotion selector'),
('en', 'ai-assistant', 'history.label', 'Conversation history'),
('en', 'ai-assistant', 'history.empty', 'Ask your first question!'),
('en', 'ai-assistant', 'loading', 'Loading response...'),
('en', 'ai-assistant', 'input.placeholder', 'Ask something...'),
('en', 'ai-assistant', 'input.label', 'Question input field'),
('en', 'ai-assistant', 'input.send', 'Send'),
('en', 'ai-assistant', 'input.tooLong', 'Question is too long (maximum {max} characters).')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Menü és üdvözlő üzenetek (avatar management)
-- Requirements: 3.3, 3.4, 6.5, 6.6, 6.8
-- -----------------------------------------------------------------------------

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'ai-assistant', 'menu.settings', 'Beállítások'),
('hu', 'ai-assistant', 'menu.install', 'Telepítés'),
('hu', 'ai-assistant', 'greeting.hu', 'Szia, {name} vagyok, miben segíthetek?'),
('hu', 'ai-assistant', 'greeting.en', 'Szia, {name} vagyok, miben segíthetek?'),
('hu', 'ai-assistant', 'greeting.defaultName', 'Asszisztens'),
('hu', 'ai-assistant', 'settings.loading', 'Betöltés...'),
('hu', 'ai-assistant', 'settings.noAvatarSelected', 'Nincs asszisztens kiválasztva'),
('hu', 'ai-assistant', 'settings.selectFromBelow', 'Válassz az alábbi listából'),
('hu', 'ai-assistant', 'settings.selectAvatar', 'Avatar kiválasztása'),
('hu', 'ai-assistant', 'settings.customName', 'Egyéni név'),
('hu', 'ai-assistant', 'settings.quality', 'Minőség'),
('hu', 'ai-assistant', 'settings.save', 'Mentés'),
('hu', 'ai-assistant', 'settings.saving', 'Mentés...'),
('hu', 'ai-assistant', 'settings.cancel', 'Mégse'),
('hu', 'ai-assistant', 'settings.saveSuccess', 'Beállítások sikeresen mentve'),
('hu', 'ai-assistant', 'settings.saveError', 'Hiba történt a mentés során'),
('hu', 'ai-assistant', 'settings.installedAvatars', 'Telepített avatárok'),
('hu', 'ai-assistant', 'settings.noAvatarsInstalled', 'Még nincs telepített avatar'),
('hu', 'ai-assistant', 'settings.installHint', 'Használd a Telepítés menüpontot új avatárok hozzáadásához'),
('hu', 'ai-assistant', 'settings.noAvatars', 'Nincs elérhető avatar')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Telepítés (install) fordítások
-- Requirements: 5.1, 5.2, 5.3, 5.4, 5.7
-- -----------------------------------------------------------------------------

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'ai-assistant', 'install.title', 'Avatar telepítése'),
('hu', 'ai-assistant', 'install.description', 'Tölts fel egy .raconapkg fájlt új avatar telepítéséhez'),
('hu', 'ai-assistant', 'install.fileLabel', 'Avatar csomag fájl'),
('hu', 'ai-assistant', 'install.invalidFileType', 'Érvénytelen fájltípus. Csak .raconapkg fájlok engedélyezettek.'),
('hu', 'ai-assistant', 'install.install', 'Telepítés'),
('hu', 'ai-assistant', 'install.installing', 'Telepítés...'),
('hu', 'ai-assistant', 'install.success', '{name} sikeresen telepítve'),
('hu', 'ai-assistant', 'install.unknownError', 'Ismeretlen hiba történt a telepítés során')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'ai-assistant', 'menu.settings', 'Settings'),
('en', 'ai-assistant', 'menu.install', 'Install'),
('en', 'ai-assistant', 'greeting.hu', 'Szia, {name} vagyok, miben segíthetek?'),
('en', 'ai-assistant', 'greeting.en', 'Hi, I''m {name}, how can I help you?'),
('en', 'ai-assistant', 'greeting.defaultName', 'Assistant'),
('en', 'ai-assistant', 'settings.loading', 'Loading...'),
('en', 'ai-assistant', 'settings.noAvatarSelected', 'No assistant selected'),
('en', 'ai-assistant', 'settings.selectFromBelow', 'Select from the list below'),
('en', 'ai-assistant', 'settings.selectAvatar', 'Select avatar'),
('en', 'ai-assistant', 'settings.customName', 'Custom name'),
('en', 'ai-assistant', 'settings.quality', 'Quality'),
('en', 'ai-assistant', 'settings.save', 'Save'),
('en', 'ai-assistant', 'settings.saving', 'Saving...'),
('en', 'ai-assistant', 'settings.cancel', 'Cancel'),
('en', 'ai-assistant', 'settings.saveSuccess', 'Settings saved successfully'),
('en', 'ai-assistant', 'settings.saveError', 'Error saving settings'),
('en', 'ai-assistant', 'settings.installedAvatars', 'Installed avatars'),
('en', 'ai-assistant', 'settings.noAvatarsInstalled', 'No avatars installed yet'),
('en', 'ai-assistant', 'settings.installHint', 'Use the Install menu to add new avatars'),
('en', 'ai-assistant', 'settings.noAvatars', 'No avatars available')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- Telepítés (install) fordítások - ANGOL
-- Requirements: 5.1, 5.2, 5.3, 5.4, 5.7
-- -----------------------------------------------------------------------------

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'ai-assistant', 'install.title', 'Install Avatar'),
('en', 'ai-assistant', 'install.description', 'Upload a .raconapkg file to install a new avatar'),
('en', 'ai-assistant', 'install.fileLabel', 'Avatar package file'),
('en', 'ai-assistant', 'install.invalidFileType', 'Invalid file type. Only .raconapkg files are allowed.'),
('en', 'ai-assistant', 'install.install', 'Install'),
('en', 'ai-assistant', 'install.installing', 'Installing...'),
('en', 'ai-assistant', 'install.success', '{name} installed successfully'),
('en', 'ai-assistant', 'install.unknownError', 'Unknown error occurred during installation')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
