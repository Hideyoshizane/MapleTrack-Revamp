import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { SYMBOL_MAP } from '@data/symbols/symbolMappings';
import { prisma } from '@lib/prisma';

import type { SymbolCategory } from '@prisma/client';

const DAILY = 'Daily Quest';

const SYMBOL_CATEGORIES: readonly SymbolCategory[] = ['arcane', 'sacred', 'grand'];

const buildTemplatesByCategory = (): Record<
	SymbolCategory,
	{ name: string; contents: { contentType: string; checked: boolean; cleared: boolean }[] }[]
> => {
	const grouped: Record<
		SymbolCategory,
		{ name: string; contents: { contentType: string; checked: boolean; cleared: boolean }[] }[]
	> = { arcane: [], sacred: [], grand: [] };

	for (const [name, info] of Object.entries(SYMBOL_MAP)) {
		grouped[info.category].push({
			name,
			contents: info.contents.map((c) => ({ contentType: c.name, checked: c.name === DAILY, cleared: false })),
		});
	}

	return grouped;
};

export const updateMissingSymbolsForCharacters = async (userId: string): Promise<void> => {
	const characters = await prisma.character.findMany({
		where: { userId },
		include: { symbols: { select: { name: true } } },
	});

	const templatesByCategory = buildTemplatesByCategory();

	for (const character of characters) {
		const existingNames = new Set(character.symbols.map((s) => s.name));

		await prisma.$transaction(async (tx) => {
			// Iterate over each category and template directly
			for (const category of SYMBOL_CATEGORIES) {
				for (const template of templatesByCategory[category]) {
					if (!existingNames.has(template.name)) {
						// Create missing symbol
						const symbolRecord = await tx.characterSymbol.create({
							data: { name: template.name, level: 1, exp: 1, category, characterId: character.id },
						});

						for (const content of template.contents) {
							const shouldSetTries =
								content.contentType !== 'Daily Quest' &&
								content.contentType !== 'Reverse City' &&
								content.contentType !== 'Yum Yum Island';

							await tx.characterContent.create({
								data: {
									contentType: content.contentType,
									checked: content.checked,
									cleared: content.cleared,
									tries: shouldSetTries ? DEFAULT_WEEKLY_TRIES : undefined,
									symbolId: symbolRecord.id,
								},
							});
						}
					}
				}
			}
		});
	}
};
