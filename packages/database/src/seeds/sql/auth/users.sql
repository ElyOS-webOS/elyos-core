-- Users seed data
-- System administrator user - must always exist
INSERT INTO auth.users (full_name, email, email_verified, username, image, user_settings, oauth_image) VALUES
  ('ElyOS', 'hello@elyos.hu', true, null, null, '{}', null)
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email_verified = EXCLUDED.email_verified;