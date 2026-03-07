/**
 * @packageDocumentation
 * Hitelesítés kapcsolatos szerver oldali segédprogramok
 */

/**
 * Jelszó erősség ellenőrzése
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push('A jelszónak legalább 8 karakter hosszúnak kell lennie');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('A jelszónak tartalmaznia kell legalább egy nagybetűt');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('A jelszónak tartalmaznia kell legalább egy kisbetűt');
	}

	if (!/\d/.test(password)) {
		errors.push('A jelszónak tartalmaznia kell legalább egy számot');
	}

	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		errors.push('A jelszónak tartalmaznia kell legalább egy speciális karaktert');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Email cím validálása
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Felhasználónév validálása
 */
export function validateUsername(username: string): { isValid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (username.length < 3) {
		errors.push('A felhasználónévnek legalább 3 karakter hosszúnak kell lennie');
	}

	if (username.length > 30) {
		errors.push('A felhasználónév maximum 30 karakter hosszú lehet');
	}

	if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
		errors.push('A felhasználónév csak betűket, számokat, aláhúzást és kötőjelet tartalmazhat');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}
