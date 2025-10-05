'use client';

import { useState, useEffect } from 'react';

import { fetchWithTimeout } from '@utils/fetch/withTimeout';

import type { Character, GetCharacterDataRequestBody, GetCharacterDataApiResponse } from '@sharedTypes/character';

interface UseCharacterDataReturn {
	character?: Character;
	setCharacter: React.Dispatch<React.SetStateAction<Character | undefined>>;
	committedName: string;
	setCommittedName: React.Dispatch<React.SetStateAction<string>>;
	loading: boolean;
	error: string | null;
}

export const useCharacterData = ({ userOrigin, server, code }: GetCharacterDataRequestBody): UseCharacterDataReturn => {
	const [character, setCharacter] = useState<Character>();
	const [committedName, setCommittedName] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect((): void => {
		if (!userOrigin || !server || !code) return;

		const fetchData = async (): Promise<void> => {
			try {
				const res = await fetchWithTimeout('/api/characters/getCharacterData', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userOrigin, server, code }),
				});
				const data = (await res.json()) as GetCharacterDataApiResponse;

				if (data.success && data.data) {
					setCharacter(data.data);
					setCommittedName(data.data.name ?? '');
				} else {
					setError(data.error ?? 'Unknown error');
				}
			} catch (error) {
				console.error('Error fetching character:', error);
				setError('Failed to fetch character data');
			} finally {
				setLoading(false);
			}
		};

		void fetchData();
	}, [userOrigin, server, code]);

	return { character, setCharacter, committedName, setCommittedName, loading, error };
};
