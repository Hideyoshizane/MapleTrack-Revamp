import { ZodError } from 'zod';

type LogLevel = 'error' | 'warn';

type LogContext = { level?: LogLevel; route?: string; requestId?: string; additional?: Record<string, unknown> };

type SerializedError = {
	name: string;
	message: string;
	stack?: string;
	code?: unknown;
	status?: unknown;
	meta?: unknown;
	cause?: unknown;
};

const MAX_CAUSE_DEPTH = 5;

const buildBasePayload = (context: LogContext): Record<string, unknown> => ({
	timestamp: new Date().toISOString(),
	level: context.level ?? 'error',
	route: context.route ?? 'unknown',
	environment: process.env.NODE_ENV ?? 'unknown',
	...(context.requestId ? { requestId: context.requestId } : {}),
	...context.additional,
});

const serializeUnknown = (value: unknown, depth = 0): unknown => {
	if (value === null || typeof value !== 'object') {
		return value;
	}

	if (depth >= MAX_CAUSE_DEPTH) {
		return '[Maximum serialization depth reached]';
	}

	if (value instanceof Error) {
		return serializeError(value, depth + 1);
	}

	if (Array.isArray(value)) {
		return value.map((item: unknown) => serializeUnknown(item, depth + 1));
	}

	const result: Record<string, unknown> = {};

	for (const [key, item] of Object.entries(value)) {
		// Avoid accidentally logging common credential and token fields.
		if (/password|secret|token|authorization|cookie/i.test(key)) {
			result[key] = '[REDACTED]';
			continue;
		}

		result[key] = serializeUnknown(item, depth + 1);
	}

	return result;
};

const serializeError = (error: Error, depth = 0): SerializedError => {
	const details = error as Error & { code?: unknown; status?: unknown; meta?: unknown };

	return {
		name: error.name,
		message: error.message,
		...(error.stack ? { stack: error.stack } : {}),
		...(details.code !== undefined ? { code: serializeUnknown(details.code) } : {}),
		...(details.status !== undefined ? { status: serializeUnknown(details.status) } : {}),
		...(details.meta !== undefined ? { meta: serializeUnknown(details.meta) } : {}),
		...(error.cause !== undefined
			? {
					cause:
						depth >= MAX_CAUSE_DEPTH
							? '[Maximum cause depth reached]'
							: serializeUnknown(error.cause, depth + 1),
				}
			: {}),
	};
};

const writeLog = (level: LogLevel, payload: Record<string, unknown>): void => {
	const output = JSON.stringify({ ...payload, level });

	switch (level) {
		case 'error':
			console.error(output);
			break;
		case 'warn':
			console.warn(output);
			break;
	}
};

export const logError = (error: unknown, context: LogContext = {}): void => {
	const level = context.level ?? 'error';
	const payload = buildBasePayload({ ...context, level });

	writeLog(level, {
		type: 'backend_error',
		...payload,
		error: error instanceof Error ? serializeError(error) : serializeUnknown(error),
	});
};

export const logApiFailure = (message: string, context: LogContext = {}): void => {
	const level = context.level ?? 'warn';

	writeLog(level, { type: 'api_failure', ...buildBasePayload({ ...context, level }), message });
};

export const logZodError = (error: unknown, context: LogContext = {}): void => {
	const level = context.level ?? 'warn';
	const payload = buildBasePayload({ ...context, level });

	if (error instanceof ZodError) {
		writeLog(level, {
			type: 'validation_error',
			...payload,
			issues: error.issues.map((issue) => ({ code: issue.code, path: issue.path, message: issue.message })),
		});

		return;
	}

	writeLog(level, {
		type: 'unknown_validation_error',
		...payload,
		error: error instanceof Error ? serializeError(error) : serializeUnknown(error),
	});
};
