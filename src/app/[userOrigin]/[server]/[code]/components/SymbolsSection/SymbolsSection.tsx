'use client';
import SymbolGrid from '../SymbolGrid/SymbolGrid';

import styles from './SymbolsSection.module.scss';

import type { CharacterDocument } from '@models/character';
import type { JSX } from 'react';

interface SymbolsSectionProps {
	character: CharacterDocument;
}

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
						<SymbolGrid
							type={section.type}
							symbols={section.symbols}
							characterLevel={level}
							characterJobType={jobType ?? 'default'}
							size={56}
						/>
					</div>
				)
			)}
		</div>
	);
};

export default SymbolsSection;
