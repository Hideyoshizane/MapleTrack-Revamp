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
	const [characterWeeklyIncome, setCharacterWeeklyIncome] = useState<number>(0);
	const [characterWeeklyBossAmount, setCharacterWeeklyBossAmount] = useState<number>(0);
	const [characterMonthlyBossAmount, setCharacterMonthlyBossAmount] = useState<number>(0);

	useEffect((): void => {
		const fetchBossList = async (): Promise<void> => {
			setLoading(true);
			try {
				const payload = { server };
				const response = await bossListApi.getEditBossList(payload);

				if (response.success && response.data) {
					const responseData = response.data;
					const firstCharacter = responseData.characters[0] ?? null;

					setServerData(responseData);
					setSelectedCharacter(firstCharacter);
					setTotalBosses(countServerBosses(responseData));

					if (firstCharacter) {
						setCharacterWeeklyIncome(firstCharacter.totalIncome);
						setCharacterWeeklyBossAmount(countCharacterBosses(firstCharacter));
						setCharacterMonthlyBossAmount(countMonthlyBosses(firstCharacter));
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
		if (!serverData || !selectedCharacter) {
			return;
		}

		const fresh = serverData.characters.find((c) => c.name === selectedCharacter.name);

		if (fresh && fresh !== selectedCharacter) {
			setSelectedCharacter(fresh);
		}
	}, [serverData]);

	useEffect((): void => {
		if (!selectedCharacter) {
			return;
		}

		setCharacterWeeklyIncome(selectedCharacter.totalIncome);
		setCharacterWeeklyBossAmount(countCharacterBosses(selectedCharacter));
		setCharacterMonthlyBossAmount(countMonthlyBosses(selectedCharacter));
	}, [selectedCharacter]);

	useEffect((): void => {
		if (!loading && !serverData) {
			router.replace('/home?missingBossList=1');
		}
	}, [loading, serverData, router]);

	const handleBossUpdate = (
		bossName: BossName,
		difficulty: BossDifficultyName,
		serverName: string,
		reset: BossReset,
		dailyTotal?: number,
	): void => {
		if (!serverData || !selectedCharacter) {
			return;
		}

		const updated = updateCharacterBoss(serverData, {
			characterName: selectedCharacter.name,
			bossName,
			difficulty,
			reset,
			dailyTotal,
			server: serverName,
		});

		setServerData(updated);
		setTotalBosses(countServerBosses(updated));
		setTotalGains(countServerGains(updated, serverName));
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
