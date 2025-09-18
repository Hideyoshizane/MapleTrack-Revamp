import { NextResponse } from 'next/server';

import { isRebootServer, getRegion, servers } from '@data/servers/servers';

import type { ExtraCharacterData } from '@/shared/types/character';
import type { ApiResponse } from '@sharedTypes/api/api';
import type { NextRequest } from 'next/server';

interface ExternalApiResponse {
	totalCount: number;
	ranks: ExtraCharacterData[];
}

export async function GET(request: NextRequest) {
	try {
		// Validate user query parameter
		const characterName = request.nextUrl.searchParams.get('character_name');
		if (!characterName) {
			return NextResponse.json<ApiResponse>(
				{
					success: false,
					error: 'Character name not provided',
				},
				{ status: 400 }
			);
		}

		// Validate server query parameter
		const server = request.nextUrl.searchParams.get('server');
		if (!server) {
			return NextResponse.json<ApiResponse>(
				{
					success: false,
					error: 'Server not provided',
				},
				{ status: 400 }
			);
		}

		// Find server object
		const serverObj = servers.find((s) => s.name.toLowerCase() === server.toLowerCase());
		if (!serverObj) {
			return NextResponse.json<ApiResponse>(
				{
					success: false,
					error: 'Server not found',
				},
				{ status: 404 }
			);
		}

		const reboot_index = isRebootServer(server) ? 1 : 0;
		const serverLocation = getRegion(serverObj);

		// Fetch external API
		const res = await fetch(
			`https://www.nexon.com/api/maplestory/no-auth/ranking/v2/${serverLocation}?type=overall&id=weekly&reboot_index=${reboot_index}&page_index=41&character_name=${characterName}`,
			{ cache: 'no-store' }
		);

		if (!res.ok) {
			return NextResponse.json<ApiResponse>(
				{
					success: false,
					error: 'Failed to fetch external character',
				},
				{ status: res.status }
			);
		}

		const data: ExternalApiResponse = (await res.json()) as ExternalApiResponse;
		const character = data.ranks?.[0] ?? null;

		if (!character) {
			return NextResponse.json<ApiResponse>(
				{
					success: false,
					error: 'Character not found',
				},
				{ status: 404 }
			);
		}

		// Success response — only return characterImgURL and level
		const simplifiedData = {
			characterImgURL: character.characterImgURL,
			level: character.level,
		};

		// Success response
		return NextResponse.json<ApiResponse<ExtraCharacterData>>(
			{
				success: true,
				message: 'Character fetched successfully',
				data: simplifiedData,
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		if (err instanceof Error) console.error('Network error:', err.message);
		else console.error('Unknown network error:', err);

		return NextResponse.json<ApiResponse>(
			{
				success: false,
				error: 'Internal server error',
			},
			{ status: 500 }
		);
	}
}
