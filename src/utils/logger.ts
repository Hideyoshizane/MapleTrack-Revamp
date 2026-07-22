import { ZodError } from 'zod';

type LogLevel = 'error' | 'warn' | 'info';

type LogContext = {
	level?: LogLevel;
	route?: string;
	additional?: Record<string, unknown>;
};

type SerializableError = {
	name: string;
	message: string;
	stack?: string;
	cause?: unknown;
};

const buildBasePayload = (context: LogContext): Record<string, unknown> => {
	return {
		timestamp: new Date().toISOString(),
		level: context.level ?? 'error',
		route: context.route ?? 'unknown',
		environment: process.env.NODE_ENV,
		...context.additional,
	};
};

const serializeError = (error: Error): SerializableError => {
	return {
		name: error.name,
		message: error.message,
		stack: error.stack,
		cause:
			error.cause instanceof Error
				? { name: error.cause.name, message: error.cause.message, stack: error.cause.stack }
				: error.cause,
	};
};

export const logError = (error: unknown, context: LogContext = {}): void => {
	const payload = buildBasePayload({ ...context, level: context.level ?? 'error' });

	if (error instanceof Error) {
		console.error(JSON.stringify({ type: 'backend_error', ...payload, error: serializeError(error) }));

		return;
	}

	console.error(JSON.stringify({ type: 'unknown_backend_error', ...payload, error }));
};

export const logApiFailure = (message: string, context: LogContext = {}): void => {
	const payload = buildBasePayload({ ...context, level: context.level ?? 'warn' });

	console.warn(JSON.stringify({ type: 'api_failure', ...payload, message }));
};

export const logZodError = (error: unknown, context: LogContext = {}): void => {
	const payload = buildBasePayload({ ...context, level: context.level ?? 'warn' });

	if (error instanceof ZodError) {
		console.warn(JSON.stringify({ type: 'validation_error', ...payload, errors: error.flatten() }));

		return;
	}

	console.warn(JSON.stringify({ type: 'unknown_validation_error', ...payload, error }));
};
