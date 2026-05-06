import DOMPurify from 'isomorphic-dompurify';

export const sanitizeInput = (input: string, escapeForMongo: boolean = true): string => {
	if (!input || typeof input !== 'string') {
		return '';
	}

	try {
		let clean = DOMPurify.sanitize(input);

		if (escapeForMongo) {
			clean = clean.replace(/\$/g, '').replace(/\./g, '');
		}

		return clean.trim();
	} catch (error) {
		console.error('Sanitization failed:', error);

		return '';
	}
};
