import DOMPurify from 'dompurify';

export const sanitizeInputFrontend = (input: string): string => {
	try {
		return DOMPurify.sanitize(input);
	} catch (error) {
		console.error('Frontend sanitization failed:', error);
		return '';
	}
};
