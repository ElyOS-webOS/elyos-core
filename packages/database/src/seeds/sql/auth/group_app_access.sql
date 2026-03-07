-- Group App Access Seed Data
-- This file assigns apps to groups

-- Sysadmin group: all apps
INSERT INTO auth.group_app_access (group_id, app_id)
SELECT 1, id FROM platform.apps
ON CONFLICT DO NOTHING;

-- Admin group: most apps
INSERT INTO auth.group_app_access (group_id, app_id) VALUES
  (2, 1),  -- Users app
  (2, 2),  -- Settings app
  (2, 3),  -- Dashboard app
  (2, 4),  -- Content app
  (2, 5),  -- Analytics app
  (2, 6)   -- Reports app
ON CONFLICT DO NOTHING;

-- Content editor group: content-related apps
INSERT INTO auth.group_app_access (group_id, app_id) VALUES
  (3, 3),  -- Dashboard app
  (3, 4),  -- Content app
  (3, 6)   -- Reports app
ON CONFLICT DO NOTHING;

-- Public user group: basic apps
INSERT INTO auth.group_app_access (group_id, app_id) VALUES
  (4, 3),  -- Dashboard app
  (4, 4)   -- Content app
ON CONFLICT DO NOTHING;
