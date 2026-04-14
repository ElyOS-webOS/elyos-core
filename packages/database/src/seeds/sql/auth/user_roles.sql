-- User roles seed data
-- Assigns users to their roles
INSERT INTO auth.user_roles (user_id, role_id) VALUES
  (1, 1)  -- Racona -> Rendszergazda
ON CONFLICT (user_id, role_id) DO NOTHING;
