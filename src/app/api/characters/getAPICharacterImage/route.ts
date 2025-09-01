import { NextResponse, NextRequest } from 'next/server';

import { ExtraCharacterData } from '@/shared/types/character';
import { isRebootServer, getRegion, servers } from '@data/servers/servers';

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

export async function GET(request: NextRequest) {
	try {
		const characterName = request.nextUrl.searchParams.get('character_name');
		if (!characterName) {
			return NextResponse.json({ success: false, error: 'Character Name not provided' }, { status: 400 });
		}

		const server = request.nextUrl.searchParams.get('server');
		if (!server) {
			return NextResponse.json({ success: false, error: 'Server not provided' }, { status: 400 });
		}

		const serverObj = servers.find((s) => s.name.toLowerCase() === server.toLowerCase());
		if (!serverObj) {
			return NextResponse.json({ success: false, error: 'Server not found' }, { status: 404 });
		}

		const reboot_index = isRebootServer(server) ? 1 : 0;
		const serverLocation = getRegion(serverObj);

		const res = await fetch(
			`https://www.nexon.com/api/maplestory/no-auth/ranking/v2/${serverLocation}?type=overall&id=weekly&reboot_index=${reboot_index}&page_index=41&character_name=${characterName}`,
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
