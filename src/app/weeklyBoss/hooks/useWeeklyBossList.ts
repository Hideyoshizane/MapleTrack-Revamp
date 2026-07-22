'use client';

import { produce } from 'immer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { bossListApi } from '@features/boss/bossListApi';

import type { ServerName } from '@data/servers/servers';
import type { getBossListResponseBody } from '@features/boss/schemas/bossList.response.schema';

type UseWeeklyBossListReturn = {
	data: getBossListResponseBody | null;
	loading: boolean;
	hasCharacters: boolean;
	weeklyBosses: number;
	totalGains: number;
	characters: getBossListResponseBody['characters'];
	toggleBoss: (bossMonsterId: string) => Promise<void>;
};

export const useWeeklyBossList = (server: ServerName): UseWeeklyBossListReturn => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [data, setData] = useState<getBossListResponseBody | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const success = searchParams.get('success');

	useEffect((): void => {
		if (success === '1') {
			toast.success('Boss List updated successfully!');
			router.replace(window.location.pathname, { scroll: false });
		}
	}, [success, router]);

	useEffect((): void => {
		const load = async (): Promise<void> => {
			setLoading(true);

			try {
				const response = await bossListApi.getBossList({ server });

				if (!response.success || !response.data) {
					setData(null);

					return;
				}

				const responseData = response.data;

				const normalized = produce(responseData, (draft) => {
					draft.weeklyBosses ??= 0;
					draft.totalGains ??= 0;
					draft.characters ??= [];
				});

				setData(normalized);
			} finally {
				setLoading(false);
			}
		};

		void load();
	}, [server]);

	const toggleBoss = async (bossMonsterId: string): Promise<void> => {
		if (!data?.id) {
			return;
		}

		try {
			const response = await bossListApi.toggleBoss({ bossListId: data.id, bossMonsterId });

			if (!response.success || !response.data) {
				toast.error('Failed to update boss');

				return;
			}

			const responseData = response.data;

			if (responseData.bossType) {
				const questTypeLabel = responseData.bossType === 'genesis' ? 'Genesis' : 'Destiny';

				const messages: string[] = [];

				if (responseData.liberationPoints !== null && responseData.liberationPoints !== 0) {
					const absolutePoints = Math.abs(responseData.liberationPoints);
					const action = responseData.liberationPoints > 0 ? 'added to' : 'removed from';
					messages.push(`${absolutePoints} points ${action} ${questTypeLabel} Liberation`);
				}

				const astraVestiges = responseData.astraVestigesPoints ?? 0;
				const astraTraces = responseData.astraTracesPoints ?? 0;

				if (astraVestiges !== 0 || astraTraces !== 0) {
					const action = astraVestiges > 0 || astraTraces > 0 ? 'added to' : 'removed from';

					const parts: string[] = [];
					if (astraVestiges !== 0) {
						parts.push(`${Math.abs(astraVestiges)} Vestiges of Erion`);
					}
					if (astraTraces !== 0) {
						parts.push(`${Math.abs(astraTraces)} Traces of Battle`);
					}

					messages.push(`${parts.join(' and ')} ${action} Astra Liberation`);
				}

				if (messages.length > 0) {
					toast.success(messages.map((message) => `• ${message}`).join('\n'));
				}
			}

			setData(
				produce((draft) => {
					if (!draft) {
						return;
					}

					draft.weeklyBosses += responseData.weeklyBossesUpdate;
					draft.totalGains += responseData.totalGainUpdate;

					for (const character of draft.characters) {
						const boss = character.bosses.find((b) => b.id === bossMonsterId);

						if (boss) {
							boss.cleared = !boss.cleared;

							break;
						}
					}
				}),
			);
		} catch {
			toast.error('Unexpected error');
		}
	};

	return {
		data,
		loading,
		hasCharacters: (data?.characters ?? []).length > 0,
		weeklyBosses: data?.weeklyBosses ?? 0,
		totalGains: data?.totalGains ?? 0,
		characters: data?.characters ?? [],
		toggleBoss,
	};
};
