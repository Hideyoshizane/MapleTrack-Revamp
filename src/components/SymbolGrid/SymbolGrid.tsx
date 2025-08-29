'use client';

import React from 'react';

import styles from './SymbolGrid.module.css';
import SymbolObject, { SymbolObjectProps } from './SymbolObject/SymbolObject';

export interface SymbolGridProps {
	type: SymbolObjectProps['type'];
	symbols: SymbolObjectProps['symbol'][];
	characterLevel: number;
	characterJobType: string;
	size?: number;
}

const SymbolGrid: React.FC<SymbolGridProps> = ({ type, symbols, characterLevel, characterJobType, size = 24 }) => {
	return (
		<div className={styles.symbolGrid}>
			{symbols.map((symbol) => (
				<SymbolObject
					key={symbol.name}
					type={type}
					symbol={symbol}
					characterLevel={characterLevel}
					characterJobType={characterJobType}
					size={size}
				/>
			))}
		</div>
	);
};

export default SymbolGrid;
