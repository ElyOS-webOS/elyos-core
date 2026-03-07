-- Users seed data
-- System administrator user - must always exist
INSERT INTO auth.users (id, full_name, email, email_verified, username, image, user_settings, oauth_image) VALUES
  (1, 'ElyOS admin', 'youradminemail@eyoursomain.com', true, null, null, '{}', null)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email_verified = EXCLUDED.email_verified;