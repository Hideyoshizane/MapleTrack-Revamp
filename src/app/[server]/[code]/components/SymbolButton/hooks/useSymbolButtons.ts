import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { DEFAULT_WEEKLY_TRIES } from '@data/character/constants';
import { getClassNameByCode } from '@data/classes/classes';
import { characterQueryKeys } from '@features/character/character.queryKeys';

import { useUpdateSymbolDaily } from '../../../hooks/useUpdateSymbolDaily';
import { useUpdateSymbolWeekly } from '../../../hooks/useUpdateSymbolWeekly';

import type {
	getCharacterDataResponseBody,
	getCharacterDataSymbolsResponseBody,
} from '@features/character/schemas/character.response.schema';

type Params = {
	symbol: getCharacterDataSymbolsResponseBody;
	bonus: number;
	onValueChange?: (data: {
		currentExp: number;
		currentLevel: number;
		dailyCleared?: boolean;
		weeklyTries?: number;
	}) => void;
	optimisticWeeklyTries?: number;
};

type UseSymbolButtonsReturn = {
	handleDailyUpdate: () => Promise<void>;
	handleWeeklyUpdate: () => Promise<void>;
	isDailyLoading: boolean;
	isWeeklyLoading: boolean;
};

export const useSymbolButtons = ({
	symbol,
	bonus,
	onValueChange,
	optimisticWeeklyTries,
}: Params): UseSymbolButtonsReturn => {
	const queryClient = useQueryClient();

	const [isDailyLoading, setIsDailyLoading] = useState(false);
	const [isWeeklyLoading, setIsWeeklyLoading] = useState(false);

	const { mutateAsync: updateDaily } = useUpdateSymbolDaily();
	const { mutateAsync: updateWeekly } = useUpdateSymbolWeekly();

	const getContext = (): { server: string; className: string } => {
		const [server, code] = window.location.pathname.split('/').filter(Boolean);
		const className = getClassNameByCode(code);

		return { server, className: className ?? '' };
	};

	const handleDailyUpdate = async (): Promise<void> => {
		// Prevent double clicks
		if (isDailyLoading) {
			return;
		}

		setIsDailyLoading(true);
		try {
			const { server, className } = getContext();

			const result = await updateDaily({ server, className, id: symbol.id, bonus });
			if (!result.success || !result.data) {
				return;
			}

			if (result.data.erionPoints) {
				toast.success(`${result.data.erionPoints} points added to Astra Liberation.`);
			}

			const updatedContents = symbol.contents.map((c, i) => (i === 0 ? { ...c, cleared: true } : c));

			onValueChange?.({
				currentExp: result.data.currentExp,
				currentLevel: result.data.currentLevel,
				dailyCleared: true,
			});

			queryClient.setQueryData(
				characterQueryKeys.detail(server, className),
				(prev: getCharacterDataResponseBody | undefined) => {
					if (!prev) {
						return prev;
					}

					const update = (
						list: getCharacterDataResponseBody['symbols']['arcane'],
					): { updated: boolean; next: typeof list } => {
						let updated = false;

						const next = list.map((s) => {
							if (s.id !== result.data?.id) {
								return s;
							}

							updated = true;
							return {
								...s,
								exp: result.data.currentExp,
								level: result.data.currentLevel,
								contents: updatedContents,
							};
						});

						return { updated, next };
					};

					const arcane = update(prev.symbols.arcane);
					if (arcane.updated) {
						return { ...prev, symbols: { ...prev.symbols, arcane: arcane.next } };
					}

					const sacred = update(prev.symbols.sacred);
					if (sacred.updated) {
						return { ...prev, symbols: { ...prev.symbols, sacred: sacred.next } };
					}

					const grand = update(prev.symbols.grand);
					if (grand.updated) {
						return { ...prev, symbols: { ...prev.symbols, grand: grand.next } };
					}

					return prev;
				},
			);
		} catch (e) {
			console.error(e);
		} finally {
			setIsDailyLoading(false);
		}
	};

	const handleWeeklyUpdate = async (): Promise<void> => {
		// Prevent double clicks
		if (isWeeklyLoading) {
			return;
		}

		setIsWeeklyLoading(true);
		try {
			const { server, className } = getContext();

			const result = await updateWeekly({ server, className, id: symbol.id });
			if (!result.success || !result.data) {
				return;
			}

			const current = optimisticWeeklyTries ?? DEFAULT_WEEKLY_TRIES;
			const next = Math.max(current - 1, 0);

			const updatedContents = symbol.contents.map((c, i) =>
				i !== 1 ? c : { ...c, tries: next, cleared: next === 0 },
			);

			onValueChange?.({
				currentExp: result.data.currentExp,
				currentLevel: result.data.currentLevel,
				weeklyTries: next,
			});

			queryClient.setQueryData(
				characterQueryKeys.detail(server, className),
				(prev: getCharacterDataResponseBody | undefined) => {
					if (!prev) {
						return prev;
					}

					const update = (
						list: getCharacterDataResponseBody['symbols']['arcane'],
					): { updated: boolean; next: typeof list } => {
						let updated = false;

						const next = list.map((s) => {
							if (s.id !== result.data?.id) {
								return s;
							}

							updated = true;
							return {
								...s,
								exp: result.data.currentExp,
								level: result.data.currentLevel,
								contents: updatedContents,
							};
						});

						return { updated, next };
					};

					const arcane = update(prev.symbols.arcane);
					if (arcane.updated) {
						return { ...prev, symbols: { ...prev.symbols, arcane: arcane.next } };
					}

					return prev;
				},
			);
		} catch (e) {
			console.error(e);
		} finally {
			setIsWeeklyLoading(false);
		}
	};

	return { handleDailyUpdate, handleWeeklyUpdate, isDailyLoading, isWeeklyLoading };
};
