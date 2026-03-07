-- Role App Access Seed Data
-- This file assigns apps to roles

-- Sysadmin role: all apps
INSERT INTO auth.role_app_access (role_id, app_id)
SELECT 1, id FROM platform.apps
ON CONFLICT DO NOTHING;

-- Admin role: most apps except system-critical ones
INSERT INTO auth.role_app_access (role_id, app_id) VALUES
  (2, 1),  -- Users app
  (2, 2),  -- Settings app
  (2, 3),  -- Dashboard app
  (2, 4),  -- Content app
  (2, 5),  -- Analytics app
  (2, 6)   -- Reports app
ON CONFLICT DO NOTHING;

-- Editor role: content-related apps
INSERT INTO auth.role_app_access (role_id, app_id) VALUES
  (3, 3),  -- Dashboard app
  (3, 4),  -- Content app
  (3, 6)   -- Reports app
ON CONFLICT DO NOTHING;

-- User role: basic apps
INSERT INTO auth.role_app_access (role_id, app_id) VALUES
  (4, 3),  -- Dashboard app
  (4, 4)   -- Content app
ON CONFLICT DO NOTHING;
