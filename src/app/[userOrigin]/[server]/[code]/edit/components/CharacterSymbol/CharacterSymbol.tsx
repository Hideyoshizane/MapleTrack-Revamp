'use client';

import styles from './CharacterSymbol.module.scss';
import EditPageSymbolGrid from './EditPageSymbolGrid/EditPageSymbolGrid';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { Character } from '@sharedTypes/character';
import type { FC, JSX } from 'react';

interface SymbolGridsProps {
	characterLevel: number;
	characterJobType: JobType;
	character?: Character;
	setCharacter: React.Dispatch<React.SetStateAction<Character | undefined>>;
}

const SYMBOL_TYPES = ['arcane', 'sacred', 'grand'] as const;

const keyMap = {
	arcane: 'ArcaneSymbol',
	sacred: 'SacredSymbol',
	grand: 'GrandSacredSymbol',
} as const;

const getTitle = (type: (typeof SYMBOL_TYPES)[number]): string => {
	if (type === 'grand') return 'Grand Sacred Symbols';
	return `${type.charAt(0).toUpperCase() + type.slice(1)} Symbols`;
};

const SymbolGrids: FC<SymbolGridsProps> = ({
	characterLevel,
	characterJobType,
	character,
	setCharacter,
}): JSX.Element => {
	if (!character) return <></>;
	return (
		<div className={styles.symbols}>
			{SYMBOL_TYPES.map((type): JSX.Element => {
				const symbolsArray = character[keyMap[type]];

				const handleChange = (updated: typeof symbolsArray): void => {
					setCharacter((prev): Character | undefined => {
						if (!prev) return prev;
						return { ...prev, [keyMap[type]]: updated };
					});
				};

				return (
					<div key={type}>
						<p className={styles.title}>{getTitle(type)}</p>
						<EditPageSymbolGrid
							type={type}
							symbols={symbolsArray}
							characterLevel={characterLevel}
							characterJobType={characterJobType}
							size={56}
							onChange={handleChange}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default SymbolGrids;
