// src/features/character/components/SymbolsSection/SymbolsSection.tsx
'use client';

import SymbolObject from '../SymbolObject/symbolObject';

import styles from './symbolsSection.module.scss';

import type { getCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type SymbolsSectionProps = {
	character: getCharacterDataResponseBody;
	disableAllDaily: boolean;
};

const SYMBOL_SIZE = 56;

const CATEGORY_TITLES: Record<keyof getCharacterDataResponseBody['symbols'], string> = {
	arcane: 'Arcane Symbols',
	sacred: 'Sacred Symbols',
	grand: 'Grand Sacred Symbols',
};

const SymbolsSection = ({ character, disableAllDaily }: SymbolsSectionProps): JSX.Element => {
	const { level, jobType, symbols } = character;

	return (
		<div className={styles.symbols}>
			{(Object.keys(symbols) as (keyof typeof symbols)[]).map((category) => {
				const categorySymbols = symbols[category];
				if (categorySymbols.length === 0) return null;

				return (
					<div key={category}>
						<p className={styles.title}>{CATEGORY_TITLES[category]}</p>

						<div className={styles.symbolGrid}>
							{categorySymbols.map((symbol) => (
								<SymbolObject
									key={symbol.name}
									type={category}
									symbol={symbol}
									characterLevel={level}
									characterJobType={jobType ?? 'default'}
									size={SYMBOL_SIZE}
									disableAllDaily={disableAllDaily}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default SymbolsSection;
