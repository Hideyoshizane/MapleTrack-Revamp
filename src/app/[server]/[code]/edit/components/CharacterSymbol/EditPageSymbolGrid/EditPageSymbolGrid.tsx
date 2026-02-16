'use client';

import EditPageSymbolObject from '../EditPageSymbolObject/EditPageSymbolObject';

import styles from './EditPageSymbolGrid.module.scss';

import type { CharacterSymbol, CharacterDraft as Character } from '@features/character/characterModel';
import type { JSX } from 'react';

type EditPageSymbolGridProps = {
	type: 'arcane' | 'sacred' | 'grand';
	symbols: CharacterSymbol[];
	characterLevel: number;
	characterJobType: string;
	size?: number;
	updateCharacter: (recipe: (draft: Character) => void) => void;
};

const EditPageSymbolGrid = ({
	type,
	symbols,
	characterLevel,
	characterJobType,
	size = 24,
	updateCharacter,
}: EditPageSymbolGridProps): JSX.Element => {
	return (
		<div className={styles.symbolGrid}>
			{symbols.map(
				(symbol): JSX.Element => (
					<EditPageSymbolObject
						key={symbol.name}
						type={type}
						symbol={symbol}
						characterLevel={characterLevel}
						characterJobType={characterJobType}
						size={size}
						updateCharacter={updateCharacter}
					/>
				)
			)}
		</div>
	);
};

export default EditPageSymbolGrid;
/**/
