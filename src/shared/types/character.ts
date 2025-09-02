import type { ApiResponse } from './api/api';
import type { CharacterDocument } from '@models/character';

// Request payload
export interface GetAllCharactersRequestBody {
	username: string;
	server: string;
}

export interface GetCharacterDataRequestBody {
	userOrigin: string;
	server: string;
	code: string;
}

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

export type GetAllCharactersApiResponse = ApiResponse<CharacterDocument[]>;

export type GetCharacterDataApiResponse = ApiResponse<CharacterDocument>;

export type GetExtraCharacterDataApiResponse = ApiResponse<ExtraCharacterData>;
