import { command, query } from '$app/server';
import * as v from 'valibot';
import { logRepository } from '$lib/server/logging/repository';
import { validatePaginationParams } from '$lib/server/utils/database';
import type { LogLevel } from '$lib/server/logging/types';

// --- Egyedi napló bejegyzés lekérése ---

const fetchErrorLogSchema = v.object({
	id: v.pipe(v.string(), v.minLength(1))
});

export const fetchErrorLog = command(fetchErrorLogSchema, async (input) => {
	try {
		const entry = await logRepository.findById(input.id);
		if (!entry) {
			return { success: false as const, error: 'Log entry not found' };
		}
		return { success: true as const, data: entry };
	} catch (error) {
		console.error('Error fetching error log:', error);
		return { success: false as const, error: 'Failed to fetch error log' };
	}
});

// --- Napló bejegyzés törlése ---

const deleteErrorLogSchema = v.object({
	id: v.pipe(v.string(), v.minLength(1))
});

export const deleteErrorLog = command(deleteErrorLogSchema, async (input) => {
	try {
		const deleted = await logRepository.deleteById(input.id);
		if (!deleted) {
			return { success: false as const, error: 'Log entry not found' };
		}
		return { success: true as const };
	} catch (error) {
		console.error('Error deleting error log:', error);
		return { success: false as const, error: 'Failed to delete error log' };
	}
});

const fetchErrorLogsSchema = v.object({
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 20),
	level: v.optional(
		v.union([
			v.picklist(['debug', 'info', 'warn', 'error', 'fatal']),
			v.array(v.picklist(['debug', 'info', 'warn', 'error', 'fatal']))
		])
	),
	source: v.optional(v.string()),
	search: v.optional(v.string()),
	sortBy: v.optional(v.string()),
	sortOrder: v.optional(v.picklist(['asc', 'desc']))
});

export type FetchErrorLogsInput = v.InferOutput<typeof fetchErrorLogsSchema>;

export const fetchErrorLogs = command(fetchErrorLogsSchema, async (input) => {
	try {
		const { page, limit, offset } = validatePaginationParams(input.page, input.pageSize);

		const filters = {
			level: input.level as LogLevel | LogLevel[] | undefined,
			source: input.source || undefined,
			sortBy: input.sortBy || 'timestamp',
			sortOrder: input.sortOrder || 'desc',
			limit,
			offset
		};

		const [rows, totalCount] = await Promise.all([
			logRepository.findMany(filters),
			logRepository.count(filters)
		]);

		return {
			success: true as const,
			data: rows,
			pagination: {
				page,
				pageSize: limit,
				totalCount,
				totalPages: Math.ceil(totalCount / limit)
			}
		};
	} catch (error) {
		console.error('Error fetching error logs:', error);
		return {
			success: false as const,
			error: 'Failed to fetch error logs',
			data: [],
			pagination: { page: 1, pageSize: 20, totalCount: 0, totalPages: 0 }
		};
	}
});
