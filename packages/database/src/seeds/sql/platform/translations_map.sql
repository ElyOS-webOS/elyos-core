-- =============================================================================
-- MAP NAMESPACE - Térkép alkalmazás fordításai
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MAGYAR (hu) fordítások
-- -----------------------------------------------------------------------------

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'map', 'tabs.search', 'Keresés'),
('hu', 'map', 'tabs.route', 'Útvonal'),
('hu', 'map', 'search.label', 'Hely keresése'),
('hu', 'map', 'search.placeholder', 'pl. Parlament, Budapest'),
('hu', 'map', 'search.button', 'Keresés'),
('hu', 'map', 'search.notFound', 'Nem található ilyen hely.'),
('hu', 'map', 'search.error', 'Hiba történt a keresés során.'),
('hu', 'map', 'search.clear', 'Törlés'),
('hu', 'map', 'route.startLabel', 'Indulás'),
('hu', 'map', 'route.startPlaceholder', 'pl. Budapest, Keleti'),
('hu', 'map', 'route.endLabel', 'Érkezés'),
('hu', 'map', 'route.endPlaceholder', 'pl. Debrecen, Főpályaudvar'),
('hu', 'map', 'route.modeLabel', 'Közlekedési mód'),
('hu', 'map', 'route.modeAuto', 'Autó'),
('hu', 'map', 'route.modePedestrian', 'Gyalog'),
('hu', 'map', 'route.modeBicycle', 'Kerékpár'),
('hu', 'map', 'route.settings', 'Beállítások'),
('hu', 'map', 'route.avoidTolls', 'Fizetős utak kerülése'),
('hu', 'map', 'route.avoidHighways', 'Autópályák kerülése'),
('hu', 'map', 'route.avoidFerries', 'Kompok kerülése'),
('hu', 'map', 'route.planButton', 'Útvonal tervezése'),
('hu', 'map', 'route.planning', 'Tervezés...'),
('hu', 'map', 'route.clear', 'Törlés'),
('hu', 'map', 'route.distance', 'Távolság'),
('hu', 'map', 'route.duration', 'Menetidő'),
('hu', 'map', 'route.notFound', 'Nem sikerült útvonalat találni.'),
('hu', 'map', 'route.serverError', 'Szerver hiba ({status}). Próbáld újra.'),
('hu', 'map', 'route.invalidResponse', 'Érvénytelen válasz a szervertől.'),
('hu', 'map', 'route.emptyFields', 'Kérlek add meg az indulási és érkezési helyet.'),
('hu', 'map', 'route.geocodeError', 'Nem található: "{place}"'),
('hu', 'map', 'route.error', 'Hiba történt az útvonal tervezése során.'),
('hu', 'map', 'locate.button', 'Aktuális hely használata'),
('hu', 'map', 'locate.notSupported', 'A böngésző nem támogatja a helymeghatározást.'),
('hu', 'map', 'locate.error', 'Nem sikerült lekérni az aktuális helyet.'),
('hu', 'map', 'depart', 'Indulás'),
('hu', 'map', 'arrive', 'Érkezés')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- ANGOL (en) fordítások
-- -----------------------------------------------------------------------------

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'map', 'tabs.search', 'Search'),
('en', 'map', 'tabs.route', 'Route'),
('en', 'map', 'search.label', 'Search place'),
('en', 'map', 'search.placeholder', 'e.g. Parliament, Budapest'),
('en', 'map', 'search.button', 'Search'),
('en', 'map', 'search.notFound', 'No places found.'),
('en', 'map', 'search.error', 'An error occurred during search.'),
('en', 'map', 'search.clear', 'Clear'),
('en', 'map', 'route.startLabel', 'From'),
('en', 'map', 'route.startPlaceholder', 'e.g. Budapest, Keleti'),
('en', 'map', 'route.endLabel', 'To'),
('en', 'map', 'route.endPlaceholder', 'e.g. Debrecen, Main Station'),
('en', 'map', 'route.modeLabel', 'Travel mode'),
('en', 'map', 'route.modeAuto', 'Car'),
('en', 'map', 'route.modePedestrian', 'Walking'),
('en', 'map', 'route.modeBicycle', 'Bicycle'),
('en', 'map', 'route.settings', 'Options'),
('en', 'map', 'route.avoidTolls', 'Avoid toll roads'),
('en', 'map', 'route.avoidHighways', 'Avoid highways'),
('en', 'map', 'route.avoidFerries', 'Avoid ferries'),
('en', 'map', 'route.planButton', 'Plan route'),
('en', 'map', 'route.planning', 'Planning...'),
('en', 'map', 'route.clear', 'Clear'),
('en', 'map', 'route.distance', 'Distance'),
('en', 'map', 'route.duration', 'Duration'),
('en', 'map', 'route.notFound', 'Could not find a route.'),
('en', 'map', 'route.serverError', 'Server error ({status}). Please try again.'),
('en', 'map', 'route.invalidResponse', 'Invalid response from server.'),
('en', 'map', 'route.emptyFields', 'Please enter both a start and end location.'),
('en', 'map', 'route.geocodeError', 'Not found: "{place}"'),
('en', 'map', 'route.error', 'An error occurred while planning the route.'),
('en', 'map', 'locate.button', 'Use current location'),
('en', 'map', 'locate.notSupported', 'Geolocation is not supported by this browser.'),
('en', 'map', 'locate.error', 'Could not retrieve current location.'),
('en', 'map', 'depart', 'From'),
('en', 'map', 'arrive', 'To')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
