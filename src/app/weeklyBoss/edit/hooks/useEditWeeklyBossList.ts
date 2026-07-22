'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { bossListApi } from '@features/boss/bossListApi';
import {
	updateCharacterBoss,
	countCharacterBosses,
	countMonthlyBosses,
	countServerBosses,
	countServerGains,
} from '@features/boss/bossListUtils';

import type { BossName, BossDifficultyName, BossReset } from '@data/bosses/bosses';
import type { ServerName } from '@data/servers/servers';
import type {
	getEditBossListResponseBody,
	getEditBossListCharacterResponseBody,
} from '@features/boss/schemas/bossList.response.schema';

type UseEditWeeklyBossListReturn = {
	loading: boolean;
	serverData: getEditBossListResponseBody | null;
	selectedCharacter: getEditBossListCharacterResponseBody | null;
	totalBosses: number;
	totalGains: number;
	characterWeeklyIncome: number;
	characterWeeklyBossAmount: number;
	characterMonthlyBossAmount: number;
	setSelectedCharacter: (char: getEditBossListCharacterResponseBody) => void;
	handleBossUpdate: (
		bossName: BossName,
		difficulty: BossDifficultyName,
		server: string,
		reset: BossReset,
		partySize: number,
		dailyTotal?: number,
	) => void;
	handleSaveChanges: (pathname: string) => Promise<void>;
};

export const useEditWeeklyBossList = (server: ServerName): UseEditWeeklyBossListReturn => {
	const router = useRouter();

	const [loading, setLoading] = useState<boolean>(true);
	const [serverData, setServerData] = useState<getEditBossListResponseBody | null>(null);
	const [selectedCharacter, setSelectedCharacter] = useState<getEditBossListCharacterResponseBody | null>(null);

	const [totalBosses, setTotalBosses] = useState<number>(0);
	const [totalGains, setTotalGains] = useState<number>(0);

	useEffect((): void => {
		const fetchBossList = async (): Promise<void> => {
			setLoading(true);

			try {
				const response = await bossListApi.getEditBossList({ server });

				if (response.success && response.data) {
					const responseData = response.data;
					const firstCharacter = responseData.characters[0] ?? null;

					setServerData(responseData);
					setSelectedCharacter(firstCharacter);
					setTotalBosses(countServerBosses(responseData));

					if (firstCharacter) {
						setTotalGains(countServerGains(responseData, server));
					}
				}
			} finally {
				setLoading(false);
			}
		};

		void fetchBossList();
	}, [server]);

	useEffect((): void => {
		if (!loading && !serverData) {
			router.replace('/home?missingBossList=1');
		}
	}, [loading, serverData, router]);

	const characterWeeklyIncome = selectedCharacter?.totalIncome ?? 0;
	const characterWeeklyBossAmount = selectedCharacter ? countCharacterBosses(selectedCharacter) : 0;
	const characterMonthlyBossAmount = selectedCharacter ? countMonthlyBosses(selectedCharacter) : 0;

	const handleBossUpdate = (
		bossName: BossName,
		difficulty: BossDifficultyName,
		serverName: string,
		reset: BossReset,
		partySize: number,
		dailyTotal?: number,
	): void => {
		if (!serverData || !selectedCharacter) {
			return;
		}

		const updatedServerData = updateCharacterBoss(serverData, {
			characterName: selectedCharacter.name,
			bossName,
			difficulty,
			reset,
			dailyTotal,
			server: serverName,
			partySize: partySize,
		});

		const updatedCharacter = updatedServerData.characters.find(
			(character) => character.name === selectedCharacter.name,
		);
		setServerData(updatedServerData);
		if (updatedCharacter) {
			setSelectedCharacter(updatedCharacter);
		}

		setTotalBosses(countServerBosses(updatedServerData));
		setTotalGains(countServerGains(updatedServerData, serverName));
	};

	const handleSaveChanges = async (pathname: string): Promise<void> => {
		if (!serverData) {
			return;
		}

		try {
			const result = await bossListApi.updateBossList(serverData);

			if (result.success) {
				const basePath = pathname.replace(/\/edit$/, '');
				router.push(`${basePath}?success=1`);
			} else {
				toast.error(result.message || 'Failed to update Boss List.');
			}
		} catch {
			toast.error('Failed to save changes');
		}
	};

	return {
		loading,
		serverData,
		selectedCharacter,
		totalBosses,
		totalGains,
		characterWeeklyIncome,
		characterWeeklyBossAmount,
		characterMonthlyBossAmount,
		setSelectedCharacter,
		handleBossUpdate,
		handleSaveChanges,
	};
};
