import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { prisma } from '@lib/prisma';

import { SYMBOL_TEMPLATES } from './characterService';

export const updateMissingSymbolsForCharacters = async (userId: string): Promise<void> => {
	const characters = await prisma.character.findMany({
		where: { userId },
		include: { symbols: { select: { name: true } } },
	});

	for (const character of characters) {
		const existingNames = new Set(character.symbols.map((s) => s.name));

		await prisma.$transaction(async (tx) => {
			// Iterate over each category and template directly
			for (const category of ['arcane', 'sacred', 'grand'] as const) {
				for (const template of SYMBOL_TEMPLATES[category]) {
					if (!existingNames.has(template.name)) {
						// Create missing symbol
						const symbolRecord = await tx.characterSymbol.create({
							data: { name: template.name, level: 1, exp: 1, category: category, characterId: character.id },
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
