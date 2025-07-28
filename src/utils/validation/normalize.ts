// Normalize usernames by trimming, removing accents, filtering unwanted characters and lowercasing
export function normalizeUsername(input: string): string {
	return input
		.trim()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-zA-Z0-9_]/g, '')
		.toLowerCase();
}

// Normalize emails by trimming and lowercasing
export function normalizeEmail(input: string): string {
	return input.trim().toLowerCase();
}
