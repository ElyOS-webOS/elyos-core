-- Groups seed data
INSERT INTO auth.groups (id, name, description) VALUES
  (1, '{"hu": "Rendszergazda", "en": "System Administrator"}', '{"hu": "Korlátlan jogosultsággal rendelkező felhasználók, akik a teljes rendszert felügyelik és karbantartják", "en": "Users with unlimited privileges who oversee and maintain the entire system"}'),
  (2, '{"hu": "Adminisztrátor", "en": "Administrator"}', '{"hu": "Teljes hozzáféréssel rendelkező felhasználók, akik kezelhetik a felhasználókat és minden adminisztrációs funkciót elérnek", "en": "Users with full access who can manage users and access all administrative functions"}'),
  (3, '{"hu": "Tartalomszerkesztő", "en": "Content Editor"}', '{"hu": "Tartalmak létrehozására és szerkesztésére jogosult felhasználók", "en": "Users authorized to create and edit content"}'),
  (4, '{"hu": "Általános felhasználó", "en": "General User"}', '{"hu": "Alapszintű hozzáféréssel rendelkező regisztrált felhasználók", "en": "Registered users with basic access level"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Szekvencia frissítése a legnagyobb id alapján
SELECT setval('auth.groups_id_seq', (SELECT COALESCE(MAX(id), 0) FROM auth.groups));
