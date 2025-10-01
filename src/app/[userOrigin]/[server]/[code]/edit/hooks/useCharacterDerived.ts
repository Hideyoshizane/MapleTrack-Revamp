'use client';

import { getJob } from '@utils/jobs/getJob';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { Character } from '@sharedTypes/character';

interface UseCharacterDerivedProps {
	character?: Character;
}

interface UseCharacterDerivedReturn {
	level: number;
	targetLevel: number;
	jobType: JobType;
	charClass?: string;
	codeChar: string;
	legion: string;
	linkSkill: string;
	job: string;
}

export const useCharacterDerived = ({ character }: UseCharacterDerivedProps): UseCharacterDerivedReturn => {
	const level = character?.level ?? 0;
	const targetLevel = character?.targetLevel ?? 0;
	const jobType = (character?.jobType ?? 'default') as JobType;
	const charClass = character?.class;
	const codeChar = character?.code ?? '';
	const legion = character?.legion ?? '';
	const linkSkill = character?.linkSkill ?? '';

	const job = getJob(level);

	return { level, targetLevel, jobType, charClass, codeChar, legion, linkSkill, job };
};
