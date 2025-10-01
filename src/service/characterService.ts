import { templateCharacter } from '@lib/template/characterTemplate';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';

import type {
	GetCharacterDataRequestBody,
	GetCharacterDataApiResponse,
	GetExtraCharacterDataApiResponse,
	UpdateCharacterRequestBody,
} from '@/shared/types/character';
import type { CharacterDocument } from '@models/character';
import type { ApiResponse } from '@sharedTypes/api';

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
	lastUpdate,
}: GenerateCharacterOptions): Partial<CharacterDocument> => {
	// Deep clone template to avoid mutating the original
	const clonedTemplate = structuredClone(templateCharacter);

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
	};
};

export const getCharacterData = async (payload: GetCharacterDataRequestBody): Promise<GetCharacterDataApiResponse> => {
	const res = await fetchWithTimeout('/api/characters/getCharacterData', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	return (await res.json()) as GetCharacterDataApiResponse;
};

export const getExtraCharacterData = async (
	characterName: string,
	server: string
): Promise<GetExtraCharacterDataApiResponse> => {
	const res = await fetch(
		`${process.env.NEXT_PUBLIC_BASE_URL}/api/characters/getCharacterDataFromAPI?character_name=${characterName}&server=${server}`
	);

	return (await res.json()) as GetExtraCharacterDataApiResponse;
};

export const updateCharacterData = async (payload: UpdateCharacterRequestBody): Promise<ApiResponse> => {
	const res = await fetchWithTimeout('/api/characters/updateCharacter', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	return (await res.json()) as ApiResponse;
};
