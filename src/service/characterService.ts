// adjust type if needed
import { templateCharacter } from '@utils/template/characterTemplate';

import type { CharacterDocument } from '@models/character';

interface GenerateCharacterOptions {
	jobClassName: string;
	jobType: string;
	legion: string;
	code: string;
	linkSkill: string;
	server: string;
	userOrigin: string;
	lastUpdate?: Date;
}
export const generateCharacterObject = ({
	jobClassName,
	jobType,
	legion,
	linkSkill,
	server,
	userOrigin,
	code,
	lastUpdate = undefined,
}: GenerateCharacterOptions): CharacterDocument => {
	// Deep clone template to avoid mutating the original
	const clonedTemplate: Partial<CharacterDocument> = structuredClone(templateCharacter);

	return {
		...clonedTemplate,
		class: jobClassName,
		code,
		jobType,
		legion,
		linkSkill,
		server,
		userOrigin,
		lastUpdate,
	} as CharacterDocument;
};
