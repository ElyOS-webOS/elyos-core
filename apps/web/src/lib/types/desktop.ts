export type DesktopShortcut = {
	id: string;
	userId: number;
	appId: string;
	position: { x: number; y: number };
	label: string | null;
	order: number;
	createdAt: Date;
	updatedAt: Date;
};

export type CreateDesktopShortcutInput = {
	appId: string;
	position: { x: number; y: number };
	label?: string | null;
};

export type UpdateShortcutPositionInput = {
	id: string;
	position: { x: number; y: number };
};
