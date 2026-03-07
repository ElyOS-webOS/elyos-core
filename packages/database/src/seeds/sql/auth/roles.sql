-- Roles seed data
INSERT INTO auth.roles (id, name, description) VALUES
  (1, '{"hu": "Rendszergazda", "en": "System Administrator"}', '{"hu": "Korlátlan jogosultsággal rendelkező szerep", "en": "Role with unlimited privileges"}'),
  (2, '{"hu": "Adminisztrátor", "en": "Administrator"}', '{"hu": "Adminisztrációs feladatok elvégzésére jogosult szerep", "en": "Role authorized for administrative tasks"}'),
  (3, '{"hu": "Szerkesztő", "en": "Editor"}', '{"hu": "Tartalmak kezelésére jogosult szerep", "en": "Role authorized for content management"}'),
  (4, '{"hu": "Felhasználó", "en": "User"}', '{"hu": "Alapszintű felhasználói szerep", "en": "Basic user role"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Szekvencia frissítése a legnagyobb id alapján
SELECT setval('auth.roles_id_seq', (SELECT COALESCE(MAX(id), 0) FROM auth.roles));
