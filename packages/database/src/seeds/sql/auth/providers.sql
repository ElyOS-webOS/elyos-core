-- Providers seed data
INSERT INTO auth.providers (name, enabled, config) VALUES
  ('credential', true, '{"allowRegistration": true, "requireEmailVerification": true, "passwordMinLength": 8}'),
  ('google', true, '{"clientId": "YOUR_GOOGLE_CLIENT_ID", "clientSecret": "YOUR_GOOGLE_CLIENT_SECRET", "callbackUrl": "http://localhost:3000/api/auth/callback/google"}'),
  ('facebook', false, '{"clientId": "", "clientSecret": "", "callbackUrl": "http://localhost:3000/api/auth/callback/facebook"}'),
  ('github', false, '{"clientId": "", "clientSecret": "", "callbackUrl": "http://localhost:3000/api/auth/callback/github"}')
ON CONFLICT (name) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  config = EXCLUDED.config;
