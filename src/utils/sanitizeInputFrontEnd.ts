import DOMPurify from 'dompurify';

export default function sanitizeInputFrontEnd(input: string): string {
	return DOMPurify.sanitize(input);
}
