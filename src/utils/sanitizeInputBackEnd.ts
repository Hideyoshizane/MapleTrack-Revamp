import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a single JSDOM window and shared DOMPurify instance
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export const sanitizeInputBackEnd = (input: string): string => {
	try {
		const sanitized = DOMPurify.sanitize(input);

		return sanitized.replace(/\$/g, '').replace(/\./g, '').trim();
	} catch (error) {
		console.error('Backend Sanitization failed:', error);
		return 'Backend sanitization failed';
	}
};
