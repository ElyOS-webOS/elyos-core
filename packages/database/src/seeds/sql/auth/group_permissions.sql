-- Group permissions seed data

-- Sysadmin group: all permissions
INSERT INTO auth.group_permissions (group_id, permission_id)
SELECT 1, id FROM auth.permissions
ON CONFLICT DO NOTHING;

-- Admin group permissions
INSERT INTO auth.group_permissions (group_id, permission_id) VALUES
  (2, 1),  -- users.view
  (2, 2),  -- users.create
  (2, 3),  -- users.update
  (2, 5),  -- groups.view
  (2, 9),  -- roles.view
  (2, 15), -- content.view
  (2, 16), -- content.create
  (2, 17), -- content.update
  (2, 18), -- content.delete
  (2, 19), -- content.publish
  (2, 20), -- settings.view
  (2, 22), -- log.error.view
  (2, 23)  -- log.activity.view
ON CONFLICT DO NOTHING;

-- Content editor group permissions
INSERT INTO auth.group_permissions (group_id, permission_id) VALUES
  (3, 15), -- content.view
  (3, 16), -- content.create
  (3, 17), -- content.update
  (3, 19)  -- content.publish
ON CONFLICT DO NOTHING;

-- Public user group permissions
INSERT INTO auth.group_permissions (group_id, permission_id) VALUES
  (4, 15)  -- content.view
ON CONFLICT DO NOTHING;
