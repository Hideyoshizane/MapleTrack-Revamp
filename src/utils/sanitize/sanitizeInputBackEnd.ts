import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a single JSDOM window and shared DOMPurify instance
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export const sanitizeInputBackEnd = (input: string): string => {
	try {
		return DOMPurify.sanitize(input);
	} catch (error) {
		console.error('Sanitization failed:', error);
		return '';
	}
};
