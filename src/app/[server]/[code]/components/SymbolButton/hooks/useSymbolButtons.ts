import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

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
		weeklyCleared?: boolean;
	}) => void;
};

type UseSymbolButtonsReturn = {
	handleDailyUpdate: () => Promise<void>;
	handleWeeklyUpdate: () => Promise<void>;
	isDailyLoading: boolean;
	isWeeklyLoading: boolean;
};

export const useSymbolButtons = ({ symbol, bonus, onValueChange }: Params): UseSymbolButtonsReturn => {
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

	const updateSymbolCache = (
		server: string,
		className: string,
		id: string,
		currentExp: number,
		currentLevel: number,
		contents: getCharacterDataSymbolsResponseBody['contents'],
	): void => {
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

					const next = list.map((item) => {
						if (item.id !== id) {
							return item;
						}

						updated = true;

						return { ...item, exp: currentExp, level: currentLevel, contents };
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
	};

	const handleDailyUpdate = async (): Promise<void> => {
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

			const updatedContents = symbol.contents.map((content, index) =>
				index === 0 ? { ...content, cleared: true } : content,
			);

			onValueChange?.({
				currentExp: result.data.currentExp,
				currentLevel: result.data.currentLevel,
				dailyCleared: true,
			});

			updateSymbolCache(
				server,
				className,
				result.data.id,
				result.data.currentExp,
				result.data.currentLevel,
				updatedContents,
			);
		} catch (error) {
			console.error(error);
		} finally {
			setIsDailyLoading(false);
		}
	};

	const handleWeeklyUpdate = async (): Promise<void> => {
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

			const updatedContents = symbol.contents.map((content, index) =>
				index === 1 ? { ...content, cleared: true } : content,
			);

			onValueChange?.({
				currentExp: result.data.currentExp,
				currentLevel: result.data.currentLevel,
				weeklyCleared: true,
			});

			updateSymbolCache(
				server,
				className,
				result.data.id,
				result.data.currentExp,
				result.data.currentLevel,
				updatedContents,
			);
		} catch (error) {
			console.error(error);
		} finally {
			setIsWeeklyLoading(false);
		}
	};

	return { handleDailyUpdate, handleWeeklyUpdate, isDailyLoading, isWeeklyLoading };
};
