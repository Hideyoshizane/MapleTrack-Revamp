'use client';

import React from 'react';

import { Symbol } from '@models/character';

import styles from './EditPageSymbolGrid.module.css';
import EditPageSymbolObject, { EditPageSymbolObjectProps } from './EditPageSymbolObject/EditPageSymbolObject';

export interface SymbolGridProps {
	type: EditPageSymbolObjectProps['type'];
	symbols: EditPageSymbolObjectProps['symbol'][];
	characterLevel: number;
	characterJobType: string;
	size?: number;
	onChange?: (updatedSymbols: Symbol[]) => void;
}

const EditPageSymbolGrid: React.FC<SymbolGridProps> = ({
	type,
	symbols,
	characterLevel,
	characterJobType,
	size = 24,
	onChange,
}) => {
	// Update a single symbol inside the array
	const handleSymbolChange = (index: number, updatedSymbol: Symbol) => {
		const updated = [...symbols];
		updated[index] = updatedSymbol;
		onChange?.(updated);
	};
	return (
		<div className={styles.symbolGrid}>
			{symbols.map((symbol, index) => (
				<EditPageSymbolObject
					key={symbol.name}
					type={type}
					symbol={symbol}
					characterLevel={characterLevel}
					characterJobType={characterJobType}
					size={size}
					onChange={(updated) => handleSymbolChange(index, updated)}
				/>
			))}
		</div>
	);
};

export default EditPageSymbolGrid;
