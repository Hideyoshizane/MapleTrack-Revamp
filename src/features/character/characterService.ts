import { characterSymbolsTemplate } from '@lib/template/characterTemplate';

import type { CharacterDraft } from './characterModel';

type GenerateCharacterOptions = {
	jobClassName: string;
	jobType: string;
	legion: string;
	linkSkill: string;
	server: string;
	lastUpdate?: Date;
};

export const generateCharacterObject = (options: GenerateCharacterOptions): CharacterDraft => {
	const { jobClassName, jobType, legion, linkSkill, server, lastUpdate } = options;

	return {
		name: 'Character Name',
		level: 0,
		targetLevel: 10,
		class: jobClassName,
		jobType,
		legion,
		linkSkill,
		server,

		lastUpdate: lastUpdate ?? null,

		bossing: false,
		syncing: false,

		symbols: characterSymbolsTemplate,
	};
};
