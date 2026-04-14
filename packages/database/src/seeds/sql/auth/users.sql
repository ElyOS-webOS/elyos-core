-- Users seed data
-- System administrator user - must always exist
INSERT INTO auth.users (id, full_name, email, email_verified, username, image, user_settings, oauth_image) VALUES
  (1, 'Racona admin', 'youradminemail@eyoursomain.com', true, null, null, '{}', null)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email_verified = EXCLUDED.email_verified;

-- Sequence visszaállítása a jelenlegi max id fölé, hogy az auto-increment ne ütközzön
SELECT setval(pg_get_serial_sequence('auth.users', 'id'), COALESCE(MAX(id), 1)) FROM auth.users;