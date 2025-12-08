import type { CharacterDocument } from '@features/character/characterModel';
import type { ApiRequest } from '@sharedTypes/api';

export type Character = Omit<CharacterDocument, keyof Document>;

export type GetAllCharactersRequestBody = ApiRequest<{
	username: string;
	server: string;
}>;

export type GetCharacterDataRequestBody = ApiRequest<{
	userOrigin: string;
	server: string;
	code: string;
}>;

export type UpdateCharacterRequestBody = ApiRequest<{
	userOrigin: string;
	server: string;
	code: string;
	data: Character;
}>;

export type CharacterDataFromAPI = {
	level: number;
	characterImgURL: string;
};
