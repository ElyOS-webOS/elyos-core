export interface ActivityEntry {
	id: string;
	actionKey: string;
	translatedAction?: string;
	userId?: string;
	resourceType?: string;
	resourceId?: string;
	context?: Record<string, unknown>;
	createdAt: string;
}

export interface ActivityLogInput {
	actionKey: string;
	userId?: string;
	resourceType?: string;
	resourceId?: string;
	context?: Record<string, unknown>;
}

export interface ActivityLogFilters {
	userId?: string;
	actionKey?: string;
	from?: Date;
	to?: Date;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}
