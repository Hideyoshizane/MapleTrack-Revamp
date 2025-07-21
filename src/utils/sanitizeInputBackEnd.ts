import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

export default function sanitizeInputBackend(input: string): string {
	return DOMPurify.sanitize(input);
}
