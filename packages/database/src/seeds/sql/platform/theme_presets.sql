-- =============================================================================
-- THEME PRESETS - Előre definiált megjelenési témák (többnyelvű)
-- =============================================================================

-- Magyar (hu)
INSERT INTO platform.theme_presets (locale, name, description, settings, is_default, sort_order, created_at, updated_at) VALUES
(
	'hu',
	'Kitsune',
	'Japán róka-szellem varázslatos színvilága',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "50",
			"colorPrimaryLightness": "0.72",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "video",
			"value": "02.mp4"
		}
	}'::jsonb,
	false, 5, NOW(), NOW()
),
(
	'hu',
	'Füst',
	'Füstszerű árnyalatok hideg türkiz fényekkel',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "185",
			"colorPrimaryLightness": "0.66",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "image",
			"value": "05.webp"
		}
	}'::jsonb,
	false, 6, NOW(), NOW()
),
(
	'hu',
	'Békés Harcos',
	'Nyugodt erő és belső béke harmóniája',
	'{
		"theme": {
			"mode": "light",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "200",
			"colorPrimaryLightness": "0.55",
			"colorPrimaryChroma": "0.14",
			"fontSize": "medium"
		},
		"background": {
			"type": "video",
			"value": "03.mp4"
		}
	}'::jsonb,
	false, 4, NOW(), NOW()
),
(
	'hu',
	'Hó',
	'Friss hótakaró kristálytiszta fehérsége',
	'{
		"theme": {
			"mode": "light",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "250",
			"colorPrimaryLightness": "0.54",
			"colorPrimaryChroma": "0.14",
			"fontSize": "medium"
		},
		"background": {
			"type": "image",
			"value": "08.webp"
		}
	}'::jsonb,
	false, 1, NOW(), NOW()
),
(
	'hu',
	'Éjfél',
	'Csillagtalan éjszaka csendes nyugalma',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "250",
			"colorPrimaryLightness": "0.66",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "color",
			"value": "#0d0d0d"
		}
	}'::jsonb,
	false, 2, NOW(), NOW()
),
(
	'hu',
	'Sakura',
	'Japán cseresznyevirág tavaszi pompája',
	'{
		"theme": {
			"mode": "auto",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "340",
			"colorPrimaryLightness": "0.66",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "image",
			"value": "06.webp"
		}
	}'::jsonb,
	false, 3, NOW(), NOW()
),
(
	'hu',
	'Bíbor hajnal',
	'Japán cseresznyevirág tavaszi pompája',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "15",
			"colorPrimaryLightness": "0.62",
			"colorPrimaryChroma": "0.12",
			"fontSize": "small"
		},
		"background": {
			"type": "video",
			"value": "04.mp4"
		}
	}'::jsonb,
	false, 3, NOW(), NOW()
)
ON CONFLICT (locale, name) DO UPDATE SET
	description = EXCLUDED.description,
	settings    = EXCLUDED.settings,
	is_default  = EXCLUDED.is_default,
	sort_order  = EXCLUDED.sort_order,
	updated_at  = NOW();

-- English (en)
INSERT INTO platform.theme_presets (locale, name, description, settings, is_default, sort_order, created_at, updated_at) VALUES
(
	'en',
	'Kitsune',
	'Magical colors of the Japanese fox spirit',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "50",
			"colorPrimaryLightness": "0.72",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "video",
			"value": "02.mp4"
		}
	}'::jsonb,
	false, 5, NOW(), NOW()
),
(
	'en',
	'Smoke',
	'Smoky shades with cold turquoise lights',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "185",
			"colorPrimaryLightness": "0.66",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "image",
			"value": "05.webp"
		}
	}'::jsonb,
	false, 6, NOW(), NOW()
),
(
	'en',
	'Peaceful Warrior',
	'Harmony of calm strength and inner peace',
	'{
		"theme": {
			"mode": "light",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "200",
			"colorPrimaryLightness": "0.55",
			"colorPrimaryChroma": "0.14",
			"fontSize": "medium"
		},
		"background": {
			"type": "video",
			"value": "03.mp4"
		}
	}'::jsonb,
	false, 4, NOW(), NOW()
),
(
	'en',
	'Snow',
	'Crystal clear whiteness of fresh snow',
	'{
		"theme": {
			"mode": "light",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "250",
			"colorPrimaryLightness": "0.54",
			"colorPrimaryChroma": "0.14",
			"fontSize": "medium"
		},
		"background": {
			"type": "image",
			"value": "08.webp"
		}
	}'::jsonb,
	false, 1, NOW(), NOW()
),
(
	'en',
	'Midnight',
	'Silent calm of a starless night',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "250",
			"colorPrimaryLightness": "0.66",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "color",
			"value": "#0d0d0d"
		}
	}'::jsonb,
	false, 2, NOW(), NOW()
),
(
	'en',
	'Sakura',
	'Spring splendor of Japanese cherry blossom',
	'{
		"theme": {
			"mode": "auto",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "340",
			"colorPrimaryLightness": "0.66",
			"colorPrimaryChroma": "0.12",
			"fontSize": "medium"
		},
		"background": {
			"type": "image",
			"value": "06.webp"
		}
	}'::jsonb,
	false, 3, NOW(), NOW()
),
(
	'en',
	'Bíbor hajnal',
	'Japán cseresznyevirág tavaszi pompája',
	'{
		"theme": {
			"mode": "dark",
			"modeTaskbarStartMenu": "dark",
			"colorPrimaryHue": "15",
			"colorPrimaryLightness": "0.62",
			"colorPrimaryChroma": "0.12",
			"fontSize": "small"
		},
		"background": {
			"type": "video",
			"value": "04.mp4"
		}
	}'::jsonb,
	false, 3, NOW(), NOW()
)
ON CONFLICT (locale, name) DO UPDATE SET
	description = EXCLUDED.description,
	settings    = EXCLUDED.settings,
	is_default  = EXCLUDED.is_default,
	sort_order  = EXCLUDED.sort_order,
	updated_at  = NOW();
