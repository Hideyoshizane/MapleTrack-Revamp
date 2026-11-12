import { isValidBossDifficulty } from '@data/bosses/bosses';
import { prisma } from '@lib/prisma';

export const removeInvalidBosses = async (userId: string): Promise<number> => {
	return prisma.$transaction(async (tx): Promise<number> => {
		const bosses = await tx.boss.findMany({
			where: { bossCharacter: { server: { bossList: { userId } } } },
			select: { id: true, name: true, difficulty: true },
		});

		const invalidBossIds = bosses
			.filter((boss) => !isValidBossDifficulty(boss.name, boss.difficulty))
			.map((boss) => boss.id);

		if (invalidBossIds.length === 0) {
			return 0;
		}

		const result = await tx.boss.deleteMany({ where: { id: { in: invalidBossIds } } });

		return result.count;
	});
};
