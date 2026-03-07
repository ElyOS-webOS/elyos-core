-- User Groups seed data
-- Assigns users to groups

-- Assign system admin to System Administrator group (group_id = 1)
INSERT INTO auth.user_groups (user_id, group_id) VALUES
  (1, 1)  -- ElyOS -> Rendszergazda
ON CONFLICT (user_id, group_id) DO NOTHING;
