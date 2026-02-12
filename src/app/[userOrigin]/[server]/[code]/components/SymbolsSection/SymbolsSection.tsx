'use client';

import { getCharacterSymbolSections } from '@features/character/characterAttributes';

import SymbolObject from '../SymbolObject/SymbolObject';

import styles from './SymbolsSection.module.scss';

import type { SymbolObjectProps } from '../SymbolObject/SymbolObject';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { JSX } from 'react';

type SymbolsSectionProps = {
	character: Character;
	disableAllDaily: boolean;
};

const SYMBOL_SIZE = 56;

const SymbolsSection = ({ character, disableAllDaily }: SymbolsSectionProps): JSX.Element => {
	const { level, jobType } = character;
	const symbolSections = getCharacterSymbolSections(character);

	return (
		<div className={styles.symbols}>
			{symbolSections.map(
				(section): JSX.Element => (
					<div key={section.type}>
						<p className={styles.title}>{section.title}</p>

						<div className={styles.symbolGrid}>
							{section.symbols.map(
								(symbol: SymbolObjectProps['symbol']): JSX.Element => (
									<SymbolObject
										key={symbol.name}
										type={section.type}
										symbol={symbol}
										characterLevel={level}
										characterJobType={jobType ?? 'default'}
										size={SYMBOL_SIZE}
										disableAllDaily={disableAllDaily}
									/>
								)
							)}
						</div>
					</div>
				)
			)}
		</div>
	);
};

export default SymbolsSection;
