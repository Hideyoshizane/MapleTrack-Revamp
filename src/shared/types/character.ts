import type { ApiResponse } from './api';
import type { CharacterDocument } from '@models/character';

// Request payload for fetching all characters of a user
export interface GetAllCharactersRequestBody {
	username: string;
	server: string;
}

// Request payload for fetching a specific character data
export interface GetCharacterDataRequestBody {
	userOrigin: string;
	server: string;
	code: string;
}

// Request payload for fetching character data from Maplestory API
export interface ExtraCharacterData {
	level: number;
	characterImgURL: string;
}

export type GetAllCharactersApiResponse = ApiResponse<CharacterDocument[]>;

export type GetCharacterDataApiResponse = ApiResponse<CharacterDocument>;

export type GetExtraCharacterDataApiResponse = ApiResponse<ExtraCharacterData>;
