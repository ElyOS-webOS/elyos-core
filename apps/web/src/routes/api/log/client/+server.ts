import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as v from 'valibot';
import { logger } from '$lib/server/logging';

const clientErrorSchema = v.object({
	message: v.pipe(v.string(), v.minLength(1)),
	stack: v.optional(v.string()),
	url: v.pipe(v.string(), v.minLength(1)),
	userAgent: v.optional(v.string()),
	timestamp: v.optional(v.string()),
	context: v.optional(v.record(v.string(), v.unknown()))
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const data = v.parse(clientErrorSchema, body);

		await logger.error(data.message, {
			source: 'client',
			stack: data.stack,
			url: data.url,
			userAgent: data.userAgent ?? request.headers.get('user-agent') ?? undefined,
			context: data.context
		});

		return json({ success: true });
	} catch (error) {
		if (v.isValiError(error)) {
			return json({ success: false, error: 'Invalid request data' }, { status: 400 });
		}

		console.error('[API /log/client] Unexpected error:', error);
		return json({ success: false, error: 'Internal server error' }, { status: 500 });
	}
};
