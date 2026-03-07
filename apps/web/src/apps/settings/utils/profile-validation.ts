/**
 * Profile validation utilities
 * Validates name and username fields for profile settings
 */

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Validates a user's full name
 *
 * Requirements:
 * - Must not be empty
 * - Must contain at least 1 non-whitespace character
 * - Maximum 100 characters
 *
 * @param name - The name to validate
 * @returns ValidationResult with valid flag and optional error message
 *
 * @example
 * validateName("John Doe") // { valid: true }
 * validateName("") // { valid: false, error: "A név megadása kötelező" }
 * validateName("   ") // { valid: false, error: "A név megadása kötelező" }
 */
export function validateName(name: string): ValidationResult {
	// Check if name is empty or only whitespace
	if (!name || name.trim().length === 0) {
		return {
			valid: false,
			error: 'A név megadása kötelező'
		};
	}

	// Check maximum length
	if (name.length > 100) {
		return {
			valid: false,
			error: 'A név maximum 100 karakter lehet'
		};
	}

	return { valid: true };
}

/**
 * Validates a username
 *
 * Requirements:
 * - Can be empty (optional field)
 * - If provided, must be alphanumeric with underscores only
 * - If provided, must be between 3-50 characters
 *
 * @param username - The username to validate
 * @returns ValidationResult with valid flag and optional error message
 *
 * @example
 * validateUsername("john_doe") // { valid: true }
 * validateUsername("") // { valid: true } - empty is allowed
 * validateUsername("ab") // { valid: false, error: "A felhasználónév minimum 3 karakter" }
 * validateUsername("user@name") // { valid: false, error: "A felhasználónév csak betűket, számokat és aláhúzást tartalmazhat" }
 */
export function validateUsername(username: string): ValidationResult {
	// Empty username is allowed (optional field)
	if (!username || username.length === 0) {
		return { valid: true };
	}

	// Check format: alphanumeric and underscores only
	const usernameRegex = /^[a-zA-Z0-9_]*$/;
	if (!usernameRegex.test(username)) {
		return {
			valid: false,
			error: 'A felhasználónév csak betűket, számokat és aláhúzást tartalmazhat'
		};
	}

	// Check minimum length
	if (username.length < 3) {
		return {
			valid: false,
			error: 'A felhasználónév minimum 3 karakter'
		};
	}

	// Check maximum length
	if (username.length > 50) {
		return {
			valid: false,
			error: 'A felhasználónév maximum 50 karakter'
		};
	}

	return { valid: true };
}
