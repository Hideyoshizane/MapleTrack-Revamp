'use client';

import { useState, useEffect } from 'react';

import { characterApi } from '@features/character/characterService';

import type { Character, GetCharacterDataRequestBody } from '@sharedTypes/character';

type UseCharacterDataReturn = {
	character?: Character;
	setCharacter: React.Dispatch<React.SetStateAction<Character | undefined>>;
	committedName: string;
	setCommittedName: React.Dispatch<React.SetStateAction<string>>;
	loading: boolean;
	error: string | null;
};

export const useCharacterData = ({ userOrigin, server, code }: GetCharacterDataRequestBody): UseCharacterDataReturn => {
	const [character, setCharacter] = useState<Character>();
	const [committedName, setCommittedName] = useState<string>('');
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect((): void => {
		if (!userOrigin || !server || !code) {
			return;
		}

		const fetchData = async (): Promise<void> => {
			setLoading(true);
			setError(null);

			const payload: GetCharacterDataRequestBody = { userOrigin, server, code };

			try {
				const response = await characterApi.getCharacterData(payload);

				if (response.success && response.data) {
					setCharacter(response.data);
					setCommittedName(response.data.name ?? '');
				} else {
					setError(response.message);
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
