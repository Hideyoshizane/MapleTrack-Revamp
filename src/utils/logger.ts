type LogLevel = 'error' | 'warn' | 'info';

export type LogContext = {
	level?: LogLevel;
	route?: string;
	userId?: string;
	token?: string;
	additional?: Record<string, unknown>;
};

export const logError = (error: unknown, context: LogContext = {}): void => {
	const logPayload: Record<string, unknown> = {
		level: context.level || 'error',
		route: context.route,
		userId: context.userId,
		token: context.token ? `${context.token.slice(0, 6)}...` : undefined,
		additional: context.additional,
	};

	if (error instanceof Error) {
		logPayload.name = error.name;
		logPayload.message = error.message;
		logPayload.stack = error.stack;
		console.error('Backend Error:', logPayload);
	} else {
		logPayload.unknownError = error;
		console.error('Backend Unknown Error:', logPayload);
	}
};

export const logApiFailure = (message: string, context: LogContext = {}): void => {
	console.warn('API Failure:', {
		message,
		route: context.route,
		userId: context.userId,
		token: context.token ? `${context.token.slice(0, 6)}...` : undefined,
		additional: context.additional,
	});
};

export const logZodError = (zodError: unknown, context: LogContext = {}): void => {
	console.warn('Validation Error:', {
		errors: zodError,
		route: context.route,
		userId: context.userId,
		additional: context.additional,
	});
};
