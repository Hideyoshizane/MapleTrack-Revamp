'use client';

import SymbolObject from '../SymbolObject/SymbolObject';

import styles from './SymbolsSection.module.scss';

import type { getCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	character: getCharacterDataResponseBody;
	disableAllDaily: boolean;
};

const CATEGORY_TITLES: Record<keyof getCharacterDataResponseBody['symbols'], string> = {
	arcane: 'Arcane Symbols',
	sacred: 'Sacred Symbols',
	grand: 'Grand Sacred Symbols',
};

const SYMBOL_SIZE = 56;

const SymbolsSection = ({ character, disableAllDaily }: Props): JSX.Element => {
	const { level, jobType, symbols } = character;

	return (
		<div className={styles.symbols}>
			{(Object.keys(symbols) as (keyof typeof symbols)[]).map((category) => {
				const categorySymbols = symbols[category];
				if (categorySymbols.length === 0) {
					return null;
				}

				return (
					<div key={category}>
						<p className={styles.title}>{CATEGORY_TITLES[category]}</p>

						<div className={styles.symbolGrid}>
							{categorySymbols.map((symbol) => (
								<SymbolObject
									characterJobType={jobType ?? 'default'}
									characterLevel={level}
									disableAllDaily={disableAllDaily}
									key={symbol.name}
									size={SYMBOL_SIZE}
									symbol={symbol}
									type={category}
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
