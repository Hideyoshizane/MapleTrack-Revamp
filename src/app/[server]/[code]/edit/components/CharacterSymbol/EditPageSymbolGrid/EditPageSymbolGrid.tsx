'use client';

import EditPageSymbolObject from '../EditPageSymbolObject/EditPageSymbolObject';

import styles from './EditPageSymbolGrid.module.scss';

import type {
	getEditCharacterDataSymbolsResponseBody,
	getEditCharacterDataResponseBody,
} from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	type: 'arcane' | 'sacred' | 'grand';
	symbols: getEditCharacterDataSymbolsResponseBody[];
	characterLevel: number;
	characterJobType: string;
	size?: number;
	updateCharacter: (recipe: (draft: getEditCharacterDataResponseBody) => void) => void;
};

const EditPageSymbolGrid = ({
	type,
	symbols,
	characterLevel,
	characterJobType,
	size = 24,
	updateCharacter,
}: Props): JSX.Element => {
	return (
		<div className={styles.symbolGrid}>
			{symbols.map(
				(symbol): JSX.Element => (
					<EditPageSymbolObject
						characterJobType={characterJobType}
						characterLevel={characterLevel}
						key={symbol.name}
						size={size}
						symbol={symbol}
						type={type}
						updateCharacter={updateCharacter}
					/>
				),
			)}
		</div>
	);
};

export default EditPageSymbolGrid;
