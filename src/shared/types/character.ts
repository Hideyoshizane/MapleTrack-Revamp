import type { CharacterDocument } from '@models/character';

// Request payload
export interface GetAllCharactersRequestBody {
	username: string;
	server: string;
}

// Success response
export interface GetAllCharactersSuccessResponse {
	success: true;
	data: CharacterDocument[];
	message: string;
}

// Error response
export interface GetAllCharactersErrorResponse {
	success: false;
	error: string;
	details?: Partial<Record<keyof GetAllCharactersRequestBody, string>>;
}

// Union type
export type GetAllCharactersApiResponse = GetAllCharactersSuccessResponse | GetAllCharactersErrorResponse;

export interface GetCharacterDataRequestBody {
	userOrigin: string;
	server: string;
	code: string;
}

// Success response
export interface GetCharacterDataSuccessResponse {
	success: true;
	data: CharacterDocument;
	message: string;
}

// Error response
export interface GetCharacterDataErrorResponse {
	success: false;
	error: string;
	details?: Partial<Record<keyof GetCharacterDataRequestBody, string>>;
}

// Union type
export type GetCharacterDataApiResponse = GetCharacterDataSuccessResponse | GetCharacterDataErrorResponse;

// Type representing the extra character data from external API
export interface ExtraCharacterData {
	characterID: number;
	characterName: string;
	exp: number;
	gap: number;
	jobDetail: number;
	jobID: number;
	level: number;
	rank: number;
	startRank: number;
	worldID: number;
	characterImgURL: string;
	worldName: string;
	isSearchTarget: boolean;
	legionLevel: number;
	raidPower: number;
	tierName: string;
	score: number;
}
