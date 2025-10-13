'use client';
import SymbolObject from '../SymbolObject/SymbolObject';

import styles from './SymbolsSection.module.scss';

import type { SymbolObjectProps } from '../SymbolObject/SymbolObject';
import type { CharacterDocument } from '@models/character';
import type { JSX } from 'react';

interface SymbolsSectionProps {
	character: CharacterDocument;
}
const SYMBOL_SIZE = 56;
const SymbolsSection = ({ character }: SymbolsSectionProps): JSX.Element => {
	const { ArcaneSymbol, SacredSymbol, GrandSacredSymbol, level, jobType } = character;

	const symbolSections = [
		{ type: 'arcane', title: 'Arcane Symbols', symbols: ArcaneSymbol },
		{ type: 'sacred', title: 'Sacred Symbols', symbols: SacredSymbol },
		{ type: 'grand', title: 'Grand Sacred Symbols', symbols: GrandSacredSymbol },
	] as const;
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
