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
    'c50b33f35dab9d7e893053ec4a4ff51a:5a1716e58a833a722daec70a35b1ecfba13506c05aa1fc52993be96d22fc89c7532ff17e0ce5c75023640b2517d9598d8201e6d259509e108826de296d541eb1',
    0,
    null,
    null
WHERE NOT EXISTS (
    SELECT 1 FROM auth.accounts WHERE user_id = 1 AND provider_id = 'credential'
);