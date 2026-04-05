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
)
SELECT
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
    '03989e2447e72e881e80ade059fa1097:5b37502bcfc3d030cf09f85d8c8798f2d28cbfbf12337ca0ed8fe7d3a05d4db3febbbe7babd713e6c8e390f01861e0892e1dabd9628d6eb85899c72bfbcc6218',
    0,
    null,
    null
WHERE NOT EXISTS (
    SELECT 1 FROM auth.accounts WHERE user_id = 1 AND provider_id = 'credential'
);