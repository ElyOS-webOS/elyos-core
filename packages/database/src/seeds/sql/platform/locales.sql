-- Seed data for locales table
-- Initial supported languages: Hungarian (hu) and English (en)

INSERT INTO platform.locales (code, name, native_name, is_active)
VALUES
	('hu', 'Hungarian', 'Magyar', true),
	('en', 'English', 'English', true)
ON CONFLICT (code) DO UPDATE SET
	name = EXCLUDED.name,
	native_name = EXCLUDED.native_name,
	is_active = EXCLUDED.is_active;
