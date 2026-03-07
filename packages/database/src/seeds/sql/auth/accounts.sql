-- Accounts seed data
-- System administrator account - must always exist
INSERT INTO auth.accounts (
  user_id,
  provider_account_id,
  provider_id,
  access_token,
  refresh_token,
  access_token_expires_at,
  refresh_token_expires_at,
  scope,
  id_token,
  is_active,
  password,
  failed_login_attempts,
  last_login_at,
  password_changed_at
) VALUES
  (
    1,
    '1',
    'credential',
    null,
    null,
    null,
    null,
    null,
    null,
    true,
    '30540913ffdcce484e5b3e768242f39b:906962e7be264fc5b8b4170b9f080edc69d125a04dcfec3f2618b568a7c66894ce9c5a7f35c72016d5a68f4ff8bc8715a7971577b44ea0bf4713b96115a417d1',
    0,
    null,
    null
  )
ON CONFLICT (id) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  provider_id = EXCLUDED.provider_id;