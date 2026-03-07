import { getContext, setContext } from 'svelte';
import type { DesktopShortcut } from '$lib/types/desktop';
import {
	getDesktopShortcuts,
	createDesktopShortcut,
	updateShortcutPosition,
	updateShortcutLabel,
	deleteDesktopShortcut
} from '$lib/services/server/desktop-shortcuts.remote';
import { withTimeout } from '$lib/utils/remote';

export const GRID_SIZE = 100; // Grid cell size in pixels

export class DesktopStore {
	shortcuts = $state<DesktopShortcut[]>([]);
	selectedShortcutId = $state<string | null>(null);
	isLoading = $state(false);
	iconsVisible = $state(true);

	async loadShortcuts() {
		this.isLoading = true;
		try {
			const response = await withTimeout(getDesktopShortcuts({}));
			if (response.success && response.shortcuts) {
				this.shortcuts = response.shortcuts;
			}
		} catch (error) {
			console.error('[DesktopStore] Error loading shortcuts:', error);
		} finally {
			this.isLoading = false;
		}
	}

	async createShortcut(appId: string, position: { x: number; y: number }, label?: string | null) {
		try {
			const response = await withTimeout(createDesktopShortcut({ appId, position, label }));
			if (response.success && response.shortcut) {
				this.shortcuts.push(response.shortcut);
				return response.shortcut;
			}
			return null;
		} catch (error) {
			console.error('[DesktopStore] Error creating shortcut:', error);
			return null;
		}
	}

	async updatePosition(id: string, position: { x: number; y: number }) {
		try {
			const response = await withTimeout(updateShortcutPosition({ id, position }));
			if (response.success && response.shortcut) {
				const index = this.shortcuts.findIndex((s) => s.id === id);
				if (index !== -1) {
					this.shortcuts[index] = response.shortcut;
				}
				return true;
			}
			return false;
		} catch (error) {
			console.error('[DesktopStore] Error updating shortcut position:', error);
			return false;
		}
	}

	async updateLabel(id: string, label: string) {
		try {
			const response = await withTimeout(updateShortcutLabel({ id, label }));
			if (response.success && response.shortcut) {
				const index = this.shortcuts.findIndex((s) => s.id === id);
				if (index !== -1) {
					this.shortcuts[index] = response.shortcut;
				}
				return true;
			}
			return false;
		} catch (error) {
			console.error('[DesktopStore] Error updating shortcut label:', error);
			return false;
		}
	}

	async deleteShortcut(id: string) {
		try {
			const response = await withTimeout(deleteDesktopShortcut({ id }));
			if (response.success) {
				this.shortcuts = this.shortcuts.filter((s) => s.id !== id);
				if (this.selectedShortcutId === id) {
					this.selectedShortcutId = null;
				}
				return true;
			}
			return false;
		} catch (error) {
			console.error('[DesktopStore] Error deleting shortcut:', error);
			return false;
		}
	}

	selectShortcut(id: string | null) {
		this.selectedShortcutId = id;
	}

	/**
	 * Snap position to grid
	 */
	snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
		return {
			x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
			y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
		};
	}

	/**
	 * Find next available grid position
	 */
	findNextAvailablePosition(
		workspaceWidth: number,
		workspaceHeight: number
	): { x: number; y: number } {
		const cols = Math.floor(workspaceWidth / GRID_SIZE);
		const rows = Math.floor(workspaceHeight / GRID_SIZE);

		// Check each grid cell from top-left to bottom-right
		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				const position = { x: col * GRID_SIZE, y: row * GRID_SIZE };

				// Check if position is occupied
				const isOccupied = this.shortcuts.some(
					(s) => s.position.x === position.x && s.position.y === position.y
				);

				if (!isOccupied) {
					return position;
				}
			}
		}

		// If all positions occupied, return top-left
		return { x: 0, y: 0 };
	}

	/**
	 * Check if position is occupied by another shortcut
	 */
	isPositionOccupied(position: { x: number; y: number }, excludeId?: string): boolean {
		return this.shortcuts.some(
			(s) => s.id !== excludeId && s.position.x === position.x && s.position.y === position.y
		);
	}

	/**
	 * Arrange all shortcuts in a grid starting from top-left, sorted by label
	 */
	async arrangeIcons(apps: Array<{ appName: string; title: string }>) {
		// Sort shortcuts by label (or app title if no label)
		const sortedShortcuts = [...this.shortcuts].sort((a, b) => {
			const labelA = a.label || apps.find((app) => app.appName === a.appId)?.title || a.appId;
			const labelB = b.label || apps.find((app) => app.appName === b.appId)?.title || b.appId;
			return labelA.localeCompare(labelB, 'hu');
		});

		// Update positions in a grid pattern (top to bottom, left to right)
		const updates = sortedShortcuts.map((shortcut, index) => {
			const col = 0; // Always first column
			const row = index;
			const position = {
				x: col * GRID_SIZE,
				y: row * GRID_SIZE
			};
			return { id: shortcut.id, position };
		});

		// Update all positions
		for (const update of updates) {
			await this.updatePosition(update.id, update.position);
		}
	}

	/**
	 * Toggle desktop icons visibility
	 */
	toggleIconsVisibility() {
		this.iconsVisible = !this.iconsVisible;
	}

	/**
	 * Reflow icons to fit within workspace bounds
	 * Moves icons that are out of bounds to available positions
	 */
	async reflowIcons(workspaceWidth: number, workspaceHeight: number) {
		const maxCols = Math.floor(workspaceWidth / GRID_SIZE);
		const maxRows = Math.floor(workspaceHeight / GRID_SIZE);

		// Find icons that are out of bounds
		const outOfBoundsIcons = this.shortcuts.filter((shortcut) => {
			const col = Math.floor(shortcut.position.x / GRID_SIZE);
			const row = Math.floor(shortcut.position.y / GRID_SIZE);
			return col >= maxCols || row >= maxRows;
		});

		if (outOfBoundsIcons.length === 0) return;

		// Create a grid map of occupied positions
		const occupiedPositions = new Set<string>();
		this.shortcuts.forEach((shortcut) => {
			const col = Math.floor(shortcut.position.x / GRID_SIZE);
			const row = Math.floor(shortcut.position.y / GRID_SIZE);
			if (col < maxCols && row < maxRows) {
				occupiedPositions.add(`${col},${row}`);
			}
		});

		// Find available positions and move out-of-bounds icons
		for (const icon of outOfBoundsIcons) {
			let foundPosition = false;

			// Search column by column, row by row
			for (let col = 0; col < maxCols && !foundPosition; col++) {
				for (let row = 0; row < maxRows && !foundPosition; row++) {
					const key = `${col},${row}`;
					if (!occupiedPositions.has(key)) {
						const newPosition = {
							x: col * GRID_SIZE,
							y: row * GRID_SIZE
						};
						await this.updatePosition(icon.id, newPosition);
						occupiedPositions.add(key);
						foundPosition = true;
					}
				}
			}
		}
	}
}

const DESKTOP_STORE_KEY = Symbol('desktopStore');

let globalDesktopStore: DesktopStore | null = null;

export function createDesktopStore() {
	if (!globalDesktopStore) {
		globalDesktopStore = new DesktopStore();
	}
	return globalDesktopStore;
}

export function setDesktopStore(store: DesktopStore) {
	globalDesktopStore = store;
	setContext(DESKTOP_STORE_KEY, store);
}

export function getDesktopStore(): DesktopStore {
	try {
		return getContext(DESKTOP_STORE_KEY);
	} catch {
		if (!globalDesktopStore) {
			globalDesktopStore = new DesktopStore();
		}
		return globalDesktopStore;
	}
}
