-- Seed data for email_templates table
-- All email templates for the system (Hungarian and English)
-- Design: Clean, professional light theme

-- WELCOME template - Hungarian
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'welcome',
	'hu',
	'Üdvözlő email',
	'Üdvözlünk a {{appName}} rendszerben!',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Üdvözlünk - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<!-- Main Card -->
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<!-- Logo -->
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<!-- Content -->
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Üdvözlünk, {{name}}!</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Örülünk, hogy csatlakozott hozzánk. A fiókja sikeresen létrejött és készen áll a kezdésre.
							</p>
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td align="center">
										<a href="{{dashboardUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">Kezdés</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<!-- Footer -->
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								Ez az e-mail a {{email}} címre lett küldve.<br>
								Ha nem Ön hozta létre ezt a fiókot, hagyja figyelmen kívül.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'Üdvözlünk a {{appName}} rendszerben, {{name}}!

A fiókja sikeresen létrejött.

Üdvözlettel,
A {{appName}} csapata',
	'["name", "email", "appName", "appNameHtml"]',
	'["dashboardUrl", "unsubscribeUrl"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- WELCOME template - English
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'welcome',
	'en',
	'Welcome email',
	'Welcome to {{appName}}!',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Welcome - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Welcome, {{name}}!</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								We''re excited to have you join us. Your account has been successfully created.
							</p>
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td align="center">
										<a href="{{dashboardUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">Get Started</a>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								This email was sent to {{email}}.<br>
								If you didn''t create this account, please ignore this email.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'Welcome to {{appName}}, {{name}}!

Your account has been successfully created.

Best regards,
The {{appName}} Team',
	'["name", "email", "appName", "appNameHtml"]',
	'["dashboardUrl", "unsubscribeUrl"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- PASSWORD_RESET template - Hungarian
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'password_reset',
	'hu',
	'Jelszó visszaállítás',
	'{{appName}} - Jelszó visszaállítás',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Jelszó visszaállítás - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Jelszó visszaállítás</h1>
							<p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Kedves {{name}},
							</p>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Jelszó visszaállítási kérelmet kaptunk a fiókjához.
							</p>
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td align="center">
										<a href="{{resetLink}}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">Jelszó visszaállítása</a>
									</td>
								</tr>
							</table>
							<p style="margin: 24px 0 0; font-size: 12px; color: #71717a; text-align: center;">
								A link {{expirationTime}} múlva lejár.<br>
								Ha nem Ön kérte, hagyja figyelmen kívül.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								Ez az e-mail a {{email}} címre lett küldve.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'Jelszó visszaállítás - {{appName}}

Kedves {{name}}!

Jelszó visszaállítási kérelmet kaptunk.
Visszaállítás: {{resetLink}}

A link {{expirationTime}} múlva lejár.

Üdvözlettel,
A {{appName}} csapata',
	'["name", "email", "resetLink", "appName", "appNameHtml", "expirationTime"]',
	'[]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- PASSWORD_RESET template - English
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'password_reset',
	'en',
	'Password Reset',
	'{{appName}} - Password Reset',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Password Reset - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Password Reset</h1>
							<p style="margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Hello {{name}},
							</p>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								We received a request to reset your password.
							</p>
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td align="center">
										<a href="{{resetLink}}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">Reset Password</a>
									</td>
								</tr>
							</table>
							<p style="margin: 24px 0 0; font-size: 12px; color: #71717a; text-align: center;">
								This link expires in {{expirationTime}}.<br>
								If you didn''t request this, please ignore.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								This email was sent to {{email}}.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'Password Reset - {{appName}}

Hello {{name}},

Reset your password: {{resetLink}}

This link expires in {{expirationTime}}.

Best regards,
The {{appName}} Team',
	'["name", "email", "resetLink", "appName", "appNameHtml", "expirationTime"]',
	'[]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();


-- EMAIL_VERIFICATION template - Hungarian
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'email_verification',
	'hu',
	'E-mail megerősítés',
	'Erősítse meg az e-mail címét - {{appName}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>E-mail megerősítés - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">E-mail megerősítés</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Kedves {{name}}! Kérjük, erősítse meg az email címét az alábbi gombra kattintva.
							</p>
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td align="center">
										<a href="{{verificationUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">E-mail megerősítése</a>
									</td>
								</tr>
							</table>
							<p style="margin: 24px 0 0; font-size: 12px; color: #71717a; text-align: center;">
								A link {{expirationTime}} múlva lejár.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								Ez az e-mail a {{email}} címre lett küldve.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'E-mail megerősítés - {{appName}}

Kedves {{name}}!

Erősítse meg az e-mail címét: {{verificationUrl}}

A link {{expirationTime}} múlva lejár.

Üdvözlettel,
A {{appName}} csapata',
	'["name", "email", "verificationUrl", "appName", "appNameHtml"]',
	'["expirationTime"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- EMAIL_VERIFICATION template - English
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'email_verification',
	'en',
	'Email Verification',
	'Verify your email - {{appName}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Email Verification - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Verify Your Email</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Hi {{name}}! Please verify your email address by clicking the button below.
							</p>
							<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
								<tr>
									<td align="center">
										<a href="{{verificationUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #22c55e; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">Verify Email</a>
									</td>
								</tr>
							</table>
							<p style="margin: 24px 0 0; font-size: 12px; color: #71717a; text-align: center;">
								This link expires in {{expirationTime}}.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								This email was sent to {{email}}.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'Email Verification - {{appName}}

Hi {{name}}!

Verify your email: {{verificationUrl}}

This link expires in {{expirationTime}}.

Best regards,
The {{appName}} Team',
	'["name", "email", "verificationUrl", "appName", "appNameHtml"]',
	'["expirationTime"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- NOTIFICATION template - Hungarian
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'notification',
	'hu',
	'Értesítés',
	'{{title}} - {{appName}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{{title}} - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">{{title}}</h1>
							<p style="margin: 0 0 8px; font-size: 14px; color: #52525b; text-align: center;">Kedves {{name}},</p>
							<div style="margin: 16px 0; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
								<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #18181b;">{{message}}</p>
							</div>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								Ez az értesítés a {{email}} címre lett küldve.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'{{title}} - {{appName}}

Kedves {{name}}!

{{message}}

Üdvözlettel,
A {{appName}} csapata',
	'["name", "email", "title", "message", "appName", "appNameHtml", "type"]',
	'["details", "actionUrl", "actionText", "timestamp", "priority", "unsubscribeUrl"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- NOTIFICATION template - English
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'notification',
	'en',
	'Notification',
	'{{title}} - {{appName}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{{title}} - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">{{title}}</h1>
							<p style="margin: 0 0 8px; font-size: 14px; color: #52525b; text-align: center;">Hello {{name}},</p>
							<div style="margin: 16px 0; padding: 16px; background-color: #f4f4f5; border-radius: 6px;">
								<p style="margin: 0; font-size: 14px; line-height: 1.6; color: #18181b;">{{message}}</p>
							</div>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								This notification was sent to {{email}}.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'{{title}} - {{appName}}

Hello {{name}},

{{message}}

Best regards,
The {{appName}} Team',
	'["name", "email", "title", "message", "appName", "appNameHtml", "type"]',
	'["details", "actionUrl", "actionText", "timestamp", "priority", "unsubscribeUrl"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();


-- TWO_FACTOR_OTP template - Hungarian
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'two_factor_otp',
	'hu',
	'Kétfaktoros hitelesítési kód',
	'{{appName}} - Hitelesítési kód: {{otp}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>2FA Kód - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Hitelesítési kód</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Kedves {{name}}, használja az alábbi kódot a bejelentkezéshez:
							</p>
							<div style="margin: 0 0 24px; padding: 20px; background-color: #f4f4f5; border-radius: 8px; text-align: center;">
								<span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #18181b; font-family: ''Courier New'', monospace;">{{otp}}</span>
							</div>
							<p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
								A kód érvényessége: {{expirationTime}}<br>
								Ha nem Ön próbált bejelentkezni, változtassa meg a jelszavát.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								Ez az e-mail a {{email}} címre lett küldve.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'{{appName}} - Hitelesítési kód

Kedves {{name}}!

A hitelesítési kódod: {{otp}}

A kód érvényessége: {{expirationTime}}

Üdvözlettel,
A {{appName}} csapata',
	'["name", "email", "otp", "appName", "appNameHtml"]',
	'["expirationTime"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- TWO_FACTOR_OTP template - English
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'two_factor_otp',
	'en',
	'Two-Factor Authentication Code',
	'{{appName}} - Your code: {{otp}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>2FA Code - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Authentication Code</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Dear {{name}}, use the following code to sign in:
							</p>
							<div style="margin: 0 0 24px; padding: 20px; background-color: #f4f4f5; border-radius: 8px; text-align: center;">
								<span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #18181b; font-family: ''Courier New'', monospace;">{{otp}}</span>
							</div>
							<p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
								This code is valid for {{expirationTime}}.<br>
								If you didn''t try to sign in, change your password.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								This email was sent to {{email}}.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'{{appName}} - Authentication Code

Dear {{name}},

Your code: {{otp}}

This code is valid for {{expirationTime}}.

Best regards,
The {{appName}} Team',
	'["name", "email", "otp", "appName", "appNameHtml"]',
	'["expirationTime"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- EMAIL_OTP_SIGN_IN template - Hungarian
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'email_otp_sign_in',
	'hu',
	'Bejelentkezési kód',
	'{{appName}} - Bejelentkezési kód: {{otp}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Bejelentkezési kód - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Bejelentkezési kód</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Használja az alábbi kódot a bejelentkezéshez:
							</p>
							<div style="margin: 0 0 24px; padding: 20px; background-color: #f4f4f5; border-radius: 8px; text-align: center;">
								<span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #18181b; font-family: ''Courier New'', monospace;">{{otp}}</span>
							</div>
							<p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
								A kód érvényessége {{expirationTime}}<br>
								Ha nem Ön kérte, hagyja figyelmen kívül.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								Ez az e-mail a {{email}} címre lett küldve.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'{{appName}} - Bejelentkezési kód

A bejelentkezési kódod: {{otp}}

A kód érvényessége: {{expirationTime}}

Üdvözlettel,
A {{appName}} csapata',
	'["email", "otp", "appName", "appNameHtml"]',
	'["expirationTime"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();

-- EMAIL_OTP_SIGN_IN template - English
INSERT INTO platform.email_templates (template_type, locale, name, subject_template, html_template, text_template, required_data, optional_data, is_active)
VALUES (
	'email_otp_sign_in',
	'en',
	'Sign-in Code',
	'{{appName}} - Sign-in code: {{otp}}',
	'<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Sign-in Code - {{appName}}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, sans-serif; background-color: #f4f4f5;">
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f5;">
		<tr>
			<td align="center" style="padding: 48px 24px;">
				<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px;">
					<tr>
						<td align="center" style="padding: 32px 32px 24px;">
							<span style="font-size: 24px; font-weight: 700; color: #3b82f6;">{{appNameHtml}}</span>
						</td>
					</tr>
					<tr>
						<td style="padding: 0 32px 32px;">
							<h1 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">Sign-in Code</h1>
							<p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #52525b; text-align: center;">
								Use the following code to sign in:
							</p>
							<div style="margin: 0 0 24px; padding: 20px; background-color: #f4f4f5; border-radius: 8px; text-align: center;">
								<span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #18181b; font-family: ''Courier New'', monospace;">{{otp}}</span>
							</div>
							<p style="margin: 0; font-size: 12px; color: #71717a; text-align: center;">
								This code is valid for {{expirationTime}}.<br>
								If you didn''t request this, please ignore.
							</p>
						</td>
					</tr>
					<tr>
						<td style="padding: 24px 32px; border-top: 1px solid #e4e4e7;">
							<p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
								This email was sent to {{email}}.
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>',
	'{{appName}} - Sign-in Code

Your sign-in code: {{otp}}

This code is valid for {{expirationTime}}.

Best regards,
The {{appName}} Team',
	'["email", "otp", "appName", "appNameHtml"]',
	'["expirationTime"]',
	true
)
ON CONFLICT (template_type, locale) DO UPDATE SET
	name = EXCLUDED.name,
	subject_template = EXCLUDED.subject_template,
	html_template = EXCLUDED.html_template,
	text_template = EXCLUDED.text_template,
	required_data = EXCLUDED.required_data,
	optional_data = EXCLUDED.optional_data,
	is_active = EXCLUDED.is_active,
	updated_at = NOW();
