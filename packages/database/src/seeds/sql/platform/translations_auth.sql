-- =============================================================================
-- AUTH NAMESPACE - Hitelesítési oldalak fordításai
-- =============================================================================
-- Ez a namespace tartalmazza a bejelentkezés, regisztráció és email
-- megerősítés oldalak szövegeit.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- MAGYAR (hu) fordítások
-- -----------------------------------------------------------------------------

-- Bejelentkezés oldal (sign-in)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signIn.title', 'Üdvözöljük'),
('hu', 'auth', 'signIn.description', 'Fiókja eléréséhez kérjük jelentkezzen be.'),
('hu', 'auth', 'signIn.email', 'E-mail cím'),
('hu', 'auth', 'signIn.emailPlaceholder', 'pelda@email.com'),
('hu', 'auth', 'signIn.password', 'Jelszó'),
('hu', 'auth', 'signIn.forgotPassword', 'Elfelejtette a jelszavát?'),
('hu', 'auth', 'signIn.submit', 'Bejelentkezés'),
('hu', 'auth', 'signIn.submitting', 'Bejelentkezés...'),
('hu', 'auth', 'signIn.googleSignIn', 'Bejelentkezés Google-lel'),
('hu', 'auth', 'signIn.noAccount', 'Nincs még fiókja?'),
('hu', 'auth', 'signIn.register', 'Regisztráljon itt')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- Bejelentkezés - hibaüzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signIn.errors.invalidEmail', 'Érvénytelen e-mail cím formátum.'),
('hu', 'auth', 'signIn.errors.emailNotVerified', 'Az e-mail címe még nincs megerősítve. A bejelentkezéshez először meg kell erősítenie az e-mail címét.'),
('hu', 'auth', 'signIn.errors.invalidCredentials', 'Helytelen e-mail cím vagy jelszó. Kérjük ellenőrizze az adatokat.'),
('hu', 'auth', 'signIn.errors.userNotFound', 'Nincs regisztrált fiók ezzel az e-mail címmel. Kérjük először regisztráljon.'),
('hu', 'auth', 'signIn.errors.accountLocked', 'A fiók ideiglenesen zárolva van. Kérjük próbálja újra később.'),
('hu', 'auth', 'signIn.errors.rateLimit', 'Túl sok bejelentkezési kísérlet. Kérjük várjon egy kicsit és próbálja újra.'),
('hu', 'auth', 'signIn.errors.generic', 'Bejelentkezési hiba történt. Kérjük próbálja újra.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Bejelentkezés - email megerősítés értesítés
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signIn.verification.title', 'E-mail megerősítés szükséges'),
('hu', 'auth', 'signIn.verification.registered', 'Sikeres regisztráció! Ellenőrizze a postafiókját a megerősítő e-mail után, majd jelentkezzen be.'),
('hu', 'auth', 'signIn.verification.required', 'A bejelentkezéshez először meg kell erősítenie az e-mail címét a regisztráció után kapott e-mailben található linkkel.'),
('hu', 'auth', 'signIn.verification.checkSpam', 'Ellenőrizze a postafiókját (beleértve a spam mappát is) a megerősítő e-mail után.'),
('hu', 'auth', 'signIn.verification.resend', 'Megerősítő e-mail újraküldése'),
('hu', 'auth', 'signIn.verification.newAccount', 'Új fiók létrehozása')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Bejelentkezés - Email OTP (jelszó nélküli bejelentkezés)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signIn.emailOtp.useEmailCode', 'Bejelentkezés e-mail kóddal'),
('hu', 'auth', 'signIn.emailOtp.usePassword', 'Bejelentkezés jelszóval'),
('hu', 'auth', 'signIn.emailOtp.send', 'Kód küldése'),
('hu', 'auth', 'signIn.emailOtp.resend', 'Kód újraküldése'),
('hu', 'auth', 'signIn.emailOtp.verify', 'Ellenőrzés'),
('hu', 'auth', 'signIn.emailOtp.code', 'E-mail kód'),
('hu', 'auth', 'signIn.emailOtp.codePlaceholder', '000000'),
('hu', 'auth', 'signIn.emailOtp.codeHint', 'Adja meg az e-mailben kapott 6 számjegyű kódot'),
('hu', 'auth', 'signIn.emailOtp.errors.codeRequired', 'Kérjük adja meg a kódot'),
('hu', 'auth', 'signIn.emailOtp.errors.invalidCode', 'Érvénytelen vagy lejárt kód')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- Regisztráció oldal (sign-up)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signUp.title', 'Fiók létrehozása'),
('hu', 'auth', 'signUp.description', 'Adja meg adatait a fiók létrehozásához'),
('hu', 'auth', 'signUp.name', 'Teljes név'),
('hu', 'auth', 'signUp.namePlaceholder', 'Kovács János'),
('hu', 'auth', 'signUp.email', 'E-mail cím'),
('hu', 'auth', 'signUp.emailPlaceholder', 'pelda@email.com'),
('hu', 'auth', 'signUp.password', 'Jelszó'),
('hu', 'auth', 'signUp.confirmPassword', 'Jelszó megerősítése'),
('hu', 'auth', 'signUp.submit', 'Fiók létrehozása'),
('hu', 'auth', 'signUp.submitting', 'Fiók létrehozása...'),
('hu', 'auth', 'signUp.googleSignUp', 'Regisztráció Google-lel'),
('hu', 'auth', 'signUp.hasAccount', 'Már van fiókja?'),
('hu', 'auth', 'signUp.signIn', 'Bejelentkezés')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Regisztráció - email megerősítés figyelmeztetés
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signUp.verification.warning', 'E-mail megerősítés szükséges'),
('hu', 'auth', 'signUp.verification.warningText', 'A regisztráció után megerősítő e-mailt fog kapni. A bejelentkezéshez kötelező az email cím megerősítése.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Regisztráció - sikeres
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signUp.success.title', 'Fiók sikeresen létrehozva!'),
('hu', 'auth', 'signUp.success.emailSent', 'Megerősítő e-mailt küldtünk a(z) {email} címre.'),
('hu', 'auth', 'signUp.success.nextSteps', 'Következő lépések:'),
('hu', 'auth', 'signUp.success.step1', 'Ellenőrizze a postafiókját (beleértve a spam mappát is)'),
('hu', 'auth', 'signUp.success.step2', 'Kattintson a megerősítő linkre az e-mailben'),
('hu', 'auth', 'signUp.success.step3', 'Ezután bejelentkezhet a fiókjába'),
('hu', 'auth', 'signUp.success.verificationRequired', '⚠️ A bejelentkezéshez kötelező az e-mail cím megerősítése!'),
('hu', 'auth', 'signUp.success.noEmail', 'Nem kapta meg az e-mailt?'),
('hu', 'auth', 'signUp.success.backToSignIn', 'Vissza a bejelentkezéshez'),
('hu', 'auth', 'signUp.success.checkSpam', 'Ellenőrizze a spam mappát is, ha nem látja az e-mailt.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- Regisztráció - validációs hibaüzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'signUp.errors.nameRequired', 'A név megadása kötelező'),
('hu', 'auth', 'signUp.errors.nameMinLength', 'A névnek legalább 2 karakter hosszúnak kell lennie'),
('hu', 'auth', 'signUp.errors.emailRequired', 'Az e-mail cím megadása kötelező'),
('hu', 'auth', 'signUp.errors.emailInvalid', 'Kérjük adjon meg egy érvényes e-mail címet'),
('hu', 'auth', 'signUp.errors.passwordRequired', 'A jelszó megadása kötelező'),
('hu', 'auth', 'signUp.errors.passwordMinLength', 'A jelszónak legalább 8 karakter hosszúnak kell lennie'),
('hu', 'auth', 'signUp.errors.passwordUppercase', 'A jelszónak tartalmaznia kell legalább egy nagybetűt'),
('hu', 'auth', 'signUp.errors.passwordLowercase', 'A jelszónak tartalmaznia kell legalább egy kisbetűt'),
('hu', 'auth', 'signUp.errors.passwordNumber', 'A jelszónak tartalmaznia kell legalább egy számot'),
('hu', 'auth', 'signUp.errors.passwordSpecial', 'A jelszónak tartalmaznia kell legalább egy speciális karaktert'),
('hu', 'auth', 'signUp.errors.confirmRequired', 'Kérjük erősítse meg a jelszót'),
('hu', 'auth', 'signUp.errors.passwordMismatch', 'A jelszavak nem egyeznek'),
('hu', 'auth', 'signUp.errors.emailExists', 'Ezzel az e-mail címmel már létezik fiók. Kérjük próbáljon bejelentkezni helyette.'),
('hu', 'auth', 'signUp.errors.network', 'Hálózati hiba miatt nem sikerült létrehozni a fiókot. Kérjük ellenőrizze az internetkapcsolatot és próbálja újra.'),
('hu', 'auth', 'signUp.errors.generic', 'A regisztráció sikertelen. Kérjük próbálja újra.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Email újraküldés oldal (resend-verification)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'resend.title', 'Megerősítő e-mail újraküldése'),
('hu', 'auth', 'resend.description', 'Adja meg e-mail címét, hogy új megerősítő e-mailt küldhessünk.'),
('hu', 'auth', 'resend.email', 'E-mail cím'),
('hu', 'auth', 'resend.emailPlaceholder', 'pelda@email.com'),
('hu', 'auth', 'resend.submit', 'Megerősítő e-mail küldése'),
('hu', 'auth', 'resend.submitting', 'Küldés...'),
('hu', 'auth', 'resend.retryIn', 'Újrapróbálkozás {seconds}s múlva'),
('hu', 'auth', 'resend.backToSignIn', 'Vissza a bejelentkezéshez'),
('hu', 'auth', 'resend.noAccount', 'Nincs még fiókja?'),
('hu', 'auth', 'resend.register', 'Regisztráljon itt'),
('hu', 'auth', 'resend.checkSpam', 'Nem kapta meg az e-mailt? Ellenőrizze a spam mappát is.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- Email újraküldés - állapot üzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'resend.success', 'Megerősítő e-mail sikeresen elküldve! Ellenőrizze a postafiókját.'),
('hu', 'auth', 'resend.errors.emailRequired', 'Kérjük adja meg az email címét'),
('hu', 'auth', 'resend.errors.emailInvalid', 'Kérjük adjon meg egy érvényes e-mail címet'),
('hu', 'auth', 'resend.errors.rateLimit', 'Túl sok kérés. Kérjük próbálja újra később.'),
('hu', 'auth', 'resend.errors.notFound', 'Ez az e-mail cím nincs regisztrálva a rendszerben.'),
('hu', 'auth', 'resend.errors.alreadyVerified', 'Ez az e-mail cím már megerősítésre került.'),
('hu', 'auth', 'resend.errors.generic', 'Hiba történt az e-mail küldése során.'),
('hu', 'auth', 'resend.errors.network', 'Hálózati hiba történt. Kérjük próbálja újra.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Elfelejtett jelszó oldal (forgot-password)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'forgotPassword.title', 'Elfelejtett jelszó'),
('hu', 'auth', 'forgotPassword.description', 'Adja meg e-mail címét, és küldünk egy linket a jelszó visszaállításához.'),
('hu', 'auth', 'forgotPassword.email', 'E-mail cím'),
('hu', 'auth', 'forgotPassword.emailPlaceholder', 'pelda@email.com'),
('hu', 'auth', 'forgotPassword.submit', 'Jelszó visszaállítási link küldése'),
('hu', 'auth', 'forgotPassword.submitting', 'Küldés...'),
('hu', 'auth', 'forgotPassword.backToSignIn', 'Vissza a bejelentkezéshez'),
('hu', 'auth', 'forgotPassword.info', 'Adja meg fiókjához tartozó e-mail címét. Ha létezik ilyen fiók, küldünk egy linket a jelszó visszaállításához.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Elfelejtett jelszó - hibaüzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'forgotPassword.errors.emailRequired', 'Kérjük adja meg az e-mail címét'),
('hu', 'auth', 'forgotPassword.errors.emailInvalid', 'Kérjük adjon meg egy érvényes e-mail címet'),
('hu', 'auth', 'forgotPassword.errors.network', 'Hálózati hiba történt. Kérjük próbálja újra.'),
('hu', 'auth', 'forgotPassword.errors.rateLimit', 'Túl sok kérés. Kérjük próbálja újra később.'),
('hu', 'auth', 'forgotPassword.errors.generic', 'Hiba történt. Kérjük próbálja újra.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Elfelejtett jelszó - sikeres üzenet
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'forgotPassword.success.title', 'E-mail elküldve'),
('hu', 'auth', 'forgotPassword.success.message', 'Ha létezik fiók ezzel az e-mail címmel ({email}), küldtünk egy linket a jelszó visszaállításához.'),
('hu', 'auth', 'forgotPassword.success.nextSteps', 'Következő lépések:'),
('hu', 'auth', 'forgotPassword.success.step1', 'Ellenőrizze a postafiókját'),
('hu', 'auth', 'forgotPassword.success.step2', 'Kattintson a jelszó visszaállítási linkre'),
('hu', 'auth', 'forgotPassword.success.step3', 'Állítson be új jelszót'),
('hu', 'auth', 'forgotPassword.success.checkSpam', 'Nem kapta meg az e-mailt? Ellenőrizze a spam mappát is.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Jelszó visszaállítás oldal (reset-password)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'resetPassword.title', 'Jelszó visszaállítása'),
('hu', 'auth', 'resetPassword.description', 'Adjon meg egy új jelszót fiókjához.'),
('hu', 'auth', 'resetPassword.newPassword', 'Új jelszó'),
('hu', 'auth', 'resetPassword.confirmPassword', 'Jelszó megerősítése'),
('hu', 'auth', 'resetPassword.submit', 'Jelszó visszaállítása'),
('hu', 'auth', 'resetPassword.submitting', 'Visszaállítás...'),
('hu', 'auth', 'resetPassword.backToSignIn', 'Vissza a bejelentkezéshez'),
('hu', 'auth', 'resetPassword.requestNewLink', 'Új link kérése')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Jelszó visszaállítás - hibaüzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'resetPassword.errors.passwordRequired', 'Kérjük adjon meg egy jelszót'),
('hu', 'auth', 'resetPassword.errors.passwordMinLength', 'A jelszónak legalább 8 karakter hosszúnak kell lennie'),
('hu', 'auth', 'resetPassword.errors.passwordUppercase', 'A jelszónak tartalmaznia kell legalább egy nagybetűt'),
('hu', 'auth', 'resetPassword.errors.passwordLowercase', 'A jelszónak tartalmaznia kell legalább egy kisbetűt'),
('hu', 'auth', 'resetPassword.errors.passwordNumber', 'A jelszónak tartalmaznia kell legalább egy számot'),
('hu', 'auth', 'resetPassword.errors.passwordSpecial', 'A jelszónak tartalmaznia kell legalább egy speciális karaktert'),
('hu', 'auth', 'resetPassword.errors.confirmRequired', 'Kérjük erősítse meg a jelszót'),
('hu', 'auth', 'resetPassword.errors.passwordMismatch', 'A jelszavak nem egyeznek'),
('hu', 'auth', 'resetPassword.errors.invalidToken', 'A jelszó visszaállítási link érvénytelen vagy lejárt'),
('hu', 'auth', 'resetPassword.errors.noToken', 'Hiányzó jelszó visszaállítási token'),
('hu', 'auth', 'resetPassword.errors.network', 'Hálózati hiba történt. Kérjük próbálja újra.'),
('hu', 'auth', 'resetPassword.errors.generic', 'Hiba történt. Kérjük próbálja újra.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Jelszó visszaállítás - sikeres üzenet
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'resetPassword.success.title', 'Jelszó sikeresen visszaállítva'),
('hu', 'auth', 'resetPassword.success.message', 'A jelszava sikeresen megváltozott. Most már bejelentkezhet az új jelszavával.'),
('hu', 'auth', 'resetPassword.success.signIn', 'Bejelentkezés')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- -----------------------------------------------------------------------------
-- ANGOL (en) fordítások
-- -----------------------------------------------------------------------------

-- Bejelentkezés oldal
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signIn.title', 'Welcome'),
('en', 'auth', 'signIn.description', 'Please sign in to access your account.'),
('en', 'auth', 'signIn.email', 'Email'),
('en', 'auth', 'signIn.emailPlaceholder', 'example@email.com'),
('en', 'auth', 'signIn.password', 'Password'),
('en', 'auth', 'signIn.forgotPassword', 'Forgot your password?'),
('en', 'auth', 'signIn.submit', 'Sign In'),
('en', 'auth', 'signIn.submitting', 'Signing in...'),
('en', 'auth', 'signIn.googleSignIn', 'Sign in with Google'),
('en', 'auth', 'signIn.noAccount', 'Don''t have an account?'),
('en', 'auth', 'signIn.register', 'Register here')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Bejelentkezés - hibaüzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signIn.errors.invalidEmail', 'Invalid email format.'),
('en', 'auth', 'signIn.errors.emailNotVerified', 'Your email address has not been verified yet. Please verify your email to sign in.'),
('en', 'auth', 'signIn.errors.invalidCredentials', 'Invalid email or password. Please check your credentials.'),
('en', 'auth', 'signIn.errors.userNotFound', 'No account found with this email. Please register first.'),
('en', 'auth', 'signIn.errors.accountLocked', 'Account temporarily locked. Please try again later.'),
('en', 'auth', 'signIn.errors.rateLimit', 'Too many login attempts. Please wait and try again.'),
('en', 'auth', 'signIn.errors.generic', 'Login error occurred. Please try again.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- Bejelentkezés - email megerősítés értesítés
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signIn.verification.title', 'Email verification required'),
('en', 'auth', 'signIn.verification.registered', 'Registration successful! Check your inbox for the verification email, then sign in.'),
('en', 'auth', 'signIn.verification.required', 'Please verify your email address using the link in the registration email before signing in.'),
('en', 'auth', 'signIn.verification.checkSpam', 'Check your inbox (including spam folder) for the verification email.'),
('en', 'auth', 'signIn.verification.resend', 'Resend verification email'),
('en', 'auth', 'signIn.verification.newAccount', 'Create new account')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Bejelentkezés - Email OTP (jelszó nélküli bejelentkezés)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signIn.emailOtp.useEmailCode', 'Sign in with email code'),
('en', 'auth', 'signIn.emailOtp.usePassword', 'Sign in with password'),
('en', 'auth', 'signIn.emailOtp.send', 'Send code'),
('en', 'auth', 'signIn.emailOtp.resend', 'Resend code'),
('en', 'auth', 'signIn.emailOtp.verify', 'Verify'),
('en', 'auth', 'signIn.emailOtp.code', 'Email code'),
('en', 'auth', 'signIn.emailOtp.codePlaceholder', '000000'),
('en', 'auth', 'signIn.emailOtp.codeHint', 'Enter the 6-digit code from your email'),
('en', 'auth', 'signIn.emailOtp.errors.codeRequired', 'Please enter the code'),
('en', 'auth', 'signIn.emailOtp.errors.invalidCode', 'Invalid or expired code')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Regisztráció oldal
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signUp.title', 'Create Account'),
('en', 'auth', 'signUp.description', 'Enter your details to create an account'),
('en', 'auth', 'signUp.name', 'Full Name'),
('en', 'auth', 'signUp.namePlaceholder', 'John Doe'),
('en', 'auth', 'signUp.email', 'Email'),
('en', 'auth', 'signUp.emailPlaceholder', 'example@email.com'),
('en', 'auth', 'signUp.password', 'Password'),
('en', 'auth', 'signUp.confirmPassword', 'Confirm Password'),
('en', 'auth', 'signUp.submit', 'Create Account'),
('en', 'auth', 'signUp.submitting', 'Creating account...'),
('en', 'auth', 'signUp.googleSignUp', 'Sign up with Google'),
('en', 'auth', 'signUp.hasAccount', 'Already have an account?'),
('en', 'auth', 'signUp.signIn', 'Sign In')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Regisztráció - email megerősítés figyelmeztetés
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signUp.verification.warning', 'Email verification required'),
('en', 'auth', 'signUp.verification.warningText', 'You will receive a verification email after registration. Email verification is required to sign in.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- Regisztráció - sikeres
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signUp.success.title', 'Account created successfully!'),
('en', 'auth', 'signUp.success.emailSent', 'We sent a verification email to {email}.'),
('en', 'auth', 'signUp.success.nextSteps', 'Next steps:'),
('en', 'auth', 'signUp.success.step1', 'Check your inbox (including spam folder)'),
('en', 'auth', 'signUp.success.step2', 'Click the verification link in the email'),
('en', 'auth', 'signUp.success.step3', 'Then you can sign in to your account'),
('en', 'auth', 'signUp.success.verificationRequired', '⚠️ Email verification is required to sign in!'),
('en', 'auth', 'signUp.success.noEmail', 'Didn''t receive the email?'),
('en', 'auth', 'signUp.success.backToSignIn', 'Back to sign in'),
('en', 'auth', 'signUp.success.checkSpam', 'Check your spam folder if you don''t see the email.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Regisztráció - validációs hibaüzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'signUp.errors.nameRequired', 'Name is required'),
('en', 'auth', 'signUp.errors.nameMinLength', 'Name must be at least 2 characters'),
('en', 'auth', 'signUp.errors.emailRequired', 'Email is required'),
('en', 'auth', 'signUp.errors.emailInvalid', 'Please enter a valid email address'),
('en', 'auth', 'signUp.errors.passwordRequired', 'Password is required'),
('en', 'auth', 'signUp.errors.passwordMinLength', 'Password must be at least 8 characters'),
('en', 'auth', 'signUp.errors.passwordUppercase', 'Password must contain at least one uppercase letter'),
('en', 'auth', 'signUp.errors.passwordLowercase', 'Password must contain at least one lowercase letter'),
('en', 'auth', 'signUp.errors.passwordNumber', 'Password must contain at least one number'),
('en', 'auth', 'signUp.errors.passwordSpecial', 'Password must contain at least one special character'),
('en', 'auth', 'signUp.errors.confirmRequired', 'Please confirm your password'),
('en', 'auth', 'signUp.errors.passwordMismatch', 'Passwords do not match'),
('en', 'auth', 'signUp.errors.emailExists', 'An account with this email already exists. Please try signing in instead.'),
('en', 'auth', 'signUp.errors.network', 'Network error. Please check your connection and try again.'),
('en', 'auth', 'signUp.errors.generic', 'Registration failed. Please try again.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();


-- Email újraküldés oldal
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'resend.title', 'Resend Verification Email'),
('en', 'auth', 'resend.description', 'Enter your email address to receive a new verification email.'),
('en', 'auth', 'resend.email', 'Email'),
('en', 'auth', 'resend.emailPlaceholder', 'example@email.com'),
('en', 'auth', 'resend.submit', 'Send Verification Email'),
('en', 'auth', 'resend.submitting', 'Sending...'),
('en', 'auth', 'resend.retryIn', 'Retry in {seconds}s'),
('en', 'auth', 'resend.backToSignIn', 'Back to sign in'),
('en', 'auth', 'resend.noAccount', 'Don''t have an account?'),
('en', 'auth', 'resend.register', 'Register here'),
('en', 'auth', 'resend.checkSpam', 'Didn''t receive the email? Check your spam folder.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Email újraküldés - állapot üzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'resend.success', 'Verification email sent successfully! Check your inbox.'),
('en', 'auth', 'resend.errors.emailRequired', 'Please enter your email address'),
('en', 'auth', 'resend.errors.emailInvalid', 'Please enter a valid email address'),
('en', 'auth', 'resend.errors.rateLimit', 'Too many requests. Please try again later.'),
('en', 'auth', 'resend.errors.notFound', 'This email address is not registered.'),
('en', 'auth', 'resend.errors.alreadyVerified', 'This email address has already been verified.'),
('en', 'auth', 'resend.errors.generic', 'Error sending email.'),
('en', 'auth', 'resend.errors.network', 'Network error. Please try again.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 2FA ellenőrzés oldal (verify-2fa)
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'verify2fa.title', 'Kétfaktoros hitelesítés'),
('hu', 'auth', 'verify2fa.description', 'Adja meg hitelesítő alkalmazásból származó kódot.'),
('hu', 'auth', 'verify2fa.code', 'Hitelesítő kód'),
('hu', 'auth', 'verify2fa.codePlaceholder', '000000'),
('hu', 'auth', 'verify2fa.codeHint', 'Adja meg a 6 számjegyű kódot hitelesítő alkalmazásból'),
('hu', 'auth', 'verify2fa.backupCode', 'Tartalék kód'),
('hu', 'auth', 'verify2fa.backupCodePlaceholder', 'xxxx-xxxx-xxxx'),
('hu', 'auth', 'verify2fa.backupCodeHint', 'Adja meg az egyik tartalék kódot'),
('hu', 'auth', 'verify2fa.trustDevice', 'Eszköz megbízhatónak jelölése 30 napra'),
('hu', 'auth', 'verify2fa.submit', 'Ellenőrzés'),
('hu', 'auth', 'verify2fa.verifying', 'Ellenőrzés...'),
('hu', 'auth', 'verify2fa.useBackupCode', 'Tartalék kód használata'),
('hu', 'auth', 'verify2fa.useAuthenticator', 'Hitelesítő alkalmazás használata'),
('hu', 'auth', 'verify2fa.sendOTP', 'Kód küldése emailben'),
('hu', 'auth', 'verify2fa.backToSignIn', 'Vissza a bejelentkezéshez')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'verify2fa.title', 'Two-Factor Authentication'),
('en', 'auth', 'verify2fa.description', 'Enter the code from your authenticator app.'),
('en', 'auth', 'verify2fa.code', 'Authentication Code'),
('en', 'auth', 'verify2fa.codePlaceholder', '000000'),
('en', 'auth', 'verify2fa.codeHint', 'Enter the 6-digit code from your authenticator app'),
('en', 'auth', 'verify2fa.backupCode', 'Backup Code'),
('en', 'auth', 'verify2fa.backupCodePlaceholder', 'xxxx-xxxx-xxxx'),
('en', 'auth', 'verify2fa.backupCodeHint', 'Enter one of your backup codes'),
('en', 'auth', 'verify2fa.trustDevice', 'Trust this device for 30 days'),
('en', 'auth', 'verify2fa.submit', 'Verify'),
('en', 'auth', 'verify2fa.verifying', 'Verifying...'),
('en', 'auth', 'verify2fa.useBackupCode', 'Use backup code'),
('en', 'auth', 'verify2fa.useAuthenticator', 'Use authenticator app'),
('en', 'auth', 'verify2fa.sendOTP', 'Send code via email'),
('en', 'auth', 'verify2fa.backToSignIn', 'Back to sign in')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 2FA ellenőrzés - hibaüzenetek
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'verify2fa.errors.invalidCode', 'Érvénytelen kód. Kérjük próbálja újra.'),
('hu', 'auth', 'verify2fa.errors.expiredCode', 'A kód lejárt. Kérjük próbáljon új kódot.'),
('hu', 'auth', 'verify2fa.errors.invalidBackupCode', 'Érvénytelen tartalék kód.'),
('hu', 'auth', 'verify2fa.errors.otpSendFailed', 'Az email küldése sikertelen.'),
('hu', 'auth', 'verify2fa.errors.generic', 'Ellenőrzési hiba történt.'),
('hu', 'auth', 'verify2fa.otpSent', 'Ellenőrző kód elküldve email címére. Ellenőrizze a postafiókját.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'verify2fa.errors.invalidCode', 'Invalid code. Please try again.'),
('en', 'auth', 'verify2fa.errors.expiredCode', 'Code expired. Please try a new code.'),
('en', 'auth', 'verify2fa.errors.invalidBackupCode', 'Invalid backup code.'),
('en', 'auth', 'verify2fa.errors.otpSendFailed', 'Failed to send email.'),
('en', 'auth', 'verify2fa.errors.generic', 'Verification error occurred.'),
('en', 'auth', 'verify2fa.otpSent', 'Verification code sent to your email. Check your inbox.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Elfelejtett jelszó oldal (forgot-password) - English
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'forgotPassword.title', 'Forgot Password'),
('en', 'auth', 'forgotPassword.description', 'Enter your email address and we''ll send you a link to reset your password.'),
('en', 'auth', 'forgotPassword.email', 'Email'),
('en', 'auth', 'forgotPassword.emailPlaceholder', 'example@email.com'),
('en', 'auth', 'forgotPassword.submit', 'Send Password Reset Link'),
('en', 'auth', 'forgotPassword.submitting', 'Sending...'),
('en', 'auth', 'forgotPassword.backToSignIn', 'Back to sign in'),
('en', 'auth', 'forgotPassword.info', 'Enter the email address associated with your account. If an account exists, we''ll send you a link to reset your password.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Elfelejtett jelszó - hibaüzenetek - English
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'forgotPassword.errors.emailRequired', 'Please enter your email address'),
('en', 'auth', 'forgotPassword.errors.emailInvalid', 'Please enter a valid email address'),
('en', 'auth', 'forgotPassword.errors.network', 'Network error occurred. Please try again.'),
('en', 'auth', 'forgotPassword.errors.rateLimit', 'Too many requests. Please try again later.'),
('en', 'auth', 'forgotPassword.errors.generic', 'An error occurred. Please try again.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Elfelejtett jelszó - sikeres üzenet - English
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'forgotPassword.success.title', 'Email Sent'),
('en', 'auth', 'forgotPassword.success.message', 'If an account exists with this email address ({email}), we''ve sent a password reset link.'),
('en', 'auth', 'forgotPassword.success.nextSteps', 'Next steps:'),
('en', 'auth', 'forgotPassword.success.step1', 'Check your inbox'),
('en', 'auth', 'forgotPassword.success.step2', 'Click the password reset link'),
('en', 'auth', 'forgotPassword.success.step3', 'Set a new password'),
('en', 'auth', 'forgotPassword.success.checkSpam', 'Didn''t receive the email? Check your spam folder.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Jelszó visszaállítás oldal (reset-password) - English
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'resetPassword.title', 'Reset Password'),
('en', 'auth', 'resetPassword.description', 'Enter a new password for your account.'),
('en', 'auth', 'resetPassword.newPassword', 'New Password'),
('en', 'auth', 'resetPassword.confirmPassword', 'Confirm Password'),
('en', 'auth', 'resetPassword.submit', 'Reset Password'),
('en', 'auth', 'resetPassword.submitting', 'Resetting...'),
('en', 'auth', 'resetPassword.backToSignIn', 'Back to sign in'),
('en', 'auth', 'resetPassword.requestNewLink', 'Request new link')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Jelszó visszaállítás - hibaüzenetek - English
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'resetPassword.errors.passwordRequired', 'Please enter a password'),
('en', 'auth', 'resetPassword.errors.passwordMinLength', 'Password must be at least 8 characters long'),
('en', 'auth', 'resetPassword.errors.passwordUppercase', 'Password must contain at least one uppercase letter'),
('en', 'auth', 'resetPassword.errors.passwordLowercase', 'Password must contain at least one lowercase letter'),
('en', 'auth', 'resetPassword.errors.passwordNumber', 'Password must contain at least one number'),
('en', 'auth', 'resetPassword.errors.passwordSpecial', 'Password must contain at least one special character'),
('en', 'auth', 'resetPassword.errors.confirmRequired', 'Please confirm your password'),
('en', 'auth', 'resetPassword.errors.passwordMismatch', 'Passwords do not match'),
('en', 'auth', 'resetPassword.errors.invalidToken', 'The password reset link is invalid or has expired'),
('en', 'auth', 'resetPassword.errors.noToken', 'Missing password reset token'),
('en', 'auth', 'resetPassword.errors.network', 'Network error occurred. Please try again.'),
('en', 'auth', 'resetPassword.errors.generic', 'An error occurred. Please try again.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Jelszó visszaállítás - sikeres üzenet - English
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'resetPassword.success.title', 'Password Reset Successfully'),
('en', 'auth', 'resetPassword.success.message', 'Your password has been changed successfully. You can now sign in with your new password.'),
('en', 'auth', 'resetPassword.success.signIn', 'Sign In')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Demo mód figyelmeztetés
INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('hu', 'auth', 'demo.notice', 'Demo mód: Ez egy bemutató környezet. A rendszer minden nap visszaáll az alapállapotba – a regisztrációk, beállítások és minden elvégzett művelet elvész. Kizárólag tesztelési célra használható.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

INSERT INTO platform.translations (locale, namespace, key, value) VALUES
('en', 'auth', 'demo.notice', 'Demo mode: This is a demonstration environment. The system resets to its default state every day – registrations, settings and all performed actions will be lost. For testing purposes only.')
ON CONFLICT (locale, namespace, key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
