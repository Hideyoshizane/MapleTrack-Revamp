'use client';

import React from 'react';

import SymbolObject from '../SymbolObject/SymbolObject';

import styles from './SymbolGrid.module.scss';

import type { SymbolObjectProps } from '../SymbolObject/SymbolObject';
import type { JSX } from 'react';

export interface SymbolGridProps {
	type: SymbolObjectProps['type'];
	symbols: SymbolObjectProps['symbol'][];
	characterLevel: number;
	characterJobType: string;
	size?: number;
}

const SymbolGrid = ({ type, symbols, characterLevel, characterJobType, size = 24 }: SymbolGridProps): JSX.Element => {
	return (
		<div className={styles.symbolGrid}>
			{symbols.map(
				(symbol): JSX.Element => (
					<SymbolObject
						key={symbol.name}
						type={type}
						symbol={symbol}
						characterLevel={characterLevel}
						characterJobType={characterJobType}
						size={size}
					/>
				)
			)}
		</div>
	);
};

export default SymbolGrid;
