import { isRebootServer, getRegion, servers } from '@data/servers/servers';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

import type { CharacterDataFromAPI } from '@sharedTypes/character';

export const fetchCharacterExternal = async (characterName: string, server: string): Promise<CharacterDataFromAPI> => {
	const sanitizedCharacterName = sanitizeInputBackEnd(characterName);
	const sanitizedServer = sanitizeInputBackEnd(server);

	const serverObj = servers.find((s): boolean => s.name.toLowerCase() === sanitizedServer.toLowerCase());
	if (!serverObj) {
		throw new Error('Server not found');
	}

	const reboot_index = isRebootServer(sanitizedServer) ? 1 : 0;
	const serverLocation = getRegion(serverObj);

	const res = await fetch(
		`https://www.nexon.com/api/maplestory/no-auth/ranking/v2/${serverLocation}?type=overall&id=weekly&reboot_index=${reboot_index}&page_index=41&character_name=${sanitizedCharacterName}`,
		{ cache: 'no-store' }
	);

	if (!res.ok) {
		throw new Error(`External API failed: ${res.status}`);
	}

	const data = (await res.json()) as { ranks: CharacterDataFromAPI[] };
	const character = data.ranks?.[0];
	if (!character) {
		throw new Error('Character not found');
	}

	return { characterImgURL: character.characterImgURL, level: character.level };
};
