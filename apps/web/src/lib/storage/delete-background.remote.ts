/**
 * DeleteBackground Remote Function
 * Háttérkép és thumbnail törlése
 */

import { command, getRequestEvent } from '$app/server';
import * as v from 'valibot';
import { deleteFromFileSystem } from '$lib/server/storage/filesystem.js';
import { StorageError } from '$lib/server/storage/types.js';

const deleteBackgroundSchema = v.object({
	filename: v.pipe(v.string(), v.minLength(1))
});

export const deleteBackground = command(deleteBackgroundSchema, async (input) => {
	const event = getRequestEvent();
	const { locals } = event;

	if (!locals.user?.id) {
		return { success: false, error: 'User not authenticated' };
	}

	const userId = locals.user.id;
	const { filename } = input;

	try {
		// Fő kép törlése
		const imagePath = `backgrounds/user-${userId}/${filename}`;
		await deleteFromFileSystem(imagePath);

		// Thumbnail törlése (ha létezik)
		try {
			const thumbPath = `backgrounds/user-${userId}/thumb-${filename}`;
			await deleteFromFileSystem(thumbPath);
		} catch {
			// Thumbnail nem létezik, nem hiba
		}

		return { success: true };
	} catch (error) {
		console.error('[DeleteBackground] Error:', error);

		if (error instanceof StorageError) {
			return { success: false, error: error.message };
		}

		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
});
