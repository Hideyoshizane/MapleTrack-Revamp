export const codeToClass = (code: string): string => {
	try {
		const exceptions: Record<string, string> = {
			ice_lightning: 'Ice & Lightning',
			fire_poison: 'Fire & Poison',
		};
		if (exceptions[code]) {
			return exceptions[code];
		}

		const spaced = code.replace(/_/g, ' ');
		const formatted = spaced.replace(/\b\w/g, (letter): string => letter.toUpperCase());

		return formatted;
	} catch (error) {
		console.error('[formatJobName] error:', error);
		throw error;
	}
};
