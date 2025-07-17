import DOMPurify from 'dompurify';

export function sanitizeInputFrontEnd(input: string): string {
	return DOMPurify.sanitize(input);
}
