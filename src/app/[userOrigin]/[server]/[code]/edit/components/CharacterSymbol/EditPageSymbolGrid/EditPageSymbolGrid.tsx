'use client';

import React from 'react';

import EditPageSymbolObject from '../EditPageSymbolObject/EditPageSymbolObject';

import styles from './EditPageSymbolGrid.module.scss';

import type { EditPageSymbolObjectProps } from '../EditPageSymbolObject/EditPageSymbolObject';
import type { CharacterSymbol } from '@models/character';
import type { JSX } from 'react';

interface SymbolGridProps {
	type: EditPageSymbolObjectProps['type'];
	symbols: EditPageSymbolObjectProps['symbol'][];
	characterLevel: number;
	characterJobType: string;
	size?: number;
	onChange?: (updatedSymbols: CharacterSymbol[]) => void;
}

const EditPageSymbolGrid: React.FC<SymbolGridProps> = ({
	type,
	symbols,
	characterLevel,
	characterJobType,
	size = 24,
	onChange,
}): JSX.Element => {
	// Update a single symbol inside the array
	const handleSymbolChange = (index: number, updatedSymbol: CharacterSymbol): void => {
		const updated = [...symbols];
		updated[index] = updatedSymbol;
		onChange?.(updated);
	};

	return (
		<div className={styles.symbolGrid}>
			{symbols.map(
				(symbol, index): JSX.Element => (
					<EditPageSymbolObject
						key={symbol.name}
						type={type}
						symbol={symbol}
						characterLevel={characterLevel}
						characterJobType={characterJobType}
						size={size}
						onChange={(updated): void => handleSymbolChange(index, updated)}
					/>
				)
			)}
		</div>
	);
};

export default EditPageSymbolGrid;
