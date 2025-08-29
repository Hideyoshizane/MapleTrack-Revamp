import { NextResponse } from 'next/server';

import { ExtraCharacterData } from '@/shared/types/character';

interface ExternalApiResponse {
	totalCount: number;
	ranks: ExtraCharacterData[];
}

export interface GetExternalCharacterSuccessResponse {
	success: true;
	data: ExtraCharacterData;
	message: string;
}

export interface GetExternalCharacterErrorResponse {
	success: false;
	error: string;
}

export type GetExternalCharacterApiResponse = GetExternalCharacterSuccessResponse | GetExternalCharacterErrorResponse;

export async function GET() {
	try {
		const res = await fetch(
			'https://www.nexon.com/api/maplestory/no-auth/ranking/v2/na?type=overall&id=weekly&reboot_index=0&page_index=41&character_name=DawnLilith',
			{ cache: 'no-store' }
		);

		if (!res.ok) {
			return NextResponse.json<GetExternalCharacterErrorResponse>(
				{ success: false, error: 'Failed to fetch external character' },
				{ status: res.status }
			);
		}

		const data: ExternalApiResponse = (await res.json()) as ExternalApiResponse;
		const character = data.ranks?.[0] ?? null;

		if (!character) {
			return NextResponse.json<GetExternalCharacterErrorResponse>(
				{ success: false, error: 'Character not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json(character);
	} catch (err: unknown) {
		if (err instanceof Error) console.error('Network error:', err.message);
		else console.error('Unknown network error:', err);

		return NextResponse.json<GetExternalCharacterErrorResponse>(
			{ success: false, error: 'Network error' },
			{ status: 500 }
		);
	}
}
