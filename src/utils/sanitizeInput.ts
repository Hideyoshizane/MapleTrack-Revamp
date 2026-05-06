export const sanitizeInput = (input: string): string => {
	if (typeof input !== 'string') {
		return '';
	}

	return (
		input
			.normalize('NFKC')
			// eslint-disable-next-line no-control-regex
			.replace(/[\u0000-\u001F\u007F]/gu, '')
			.trim()
	);
};
