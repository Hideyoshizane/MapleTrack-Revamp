export const codeToClass = (code: string): string => {
	const exceptions: Record<string, string> = {
		ice_lightning: 'Ice & Lightning',
		fire_poison: 'Fire & Poison',
	};

	if (exceptions[code]) {
		return exceptions[code];
	}

	const className = code.replace(/_/g, ' ');
	return className.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
};
