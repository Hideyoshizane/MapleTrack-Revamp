'use client';
import SymbolGrid from '../SymbolGrid/SymbolGrid';

import styles from './SymbolsSection.module.scss';

import type { CharacterDocument } from '@models/character';
import type { JSX } from 'react';

interface SymbolsSectionProps {
	character: CharacterDocument;
}

const SymbolsSection = ({ character }: SymbolsSectionProps): JSX.Element => {
	const symbolSections = [
		{ type: 'arcane', title: 'Arcane Symbols', symbols: character.ArcaneSymbol, level: character.level },
		{ type: 'sacred', title: 'Sacred Symbols', symbols: character.SacredSymbol, level: character.level },
		{ type: 'grand', title: 'Grand Sacred Symbols', symbols: character.GrandSacredSymbol, level: character.level },
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
							characterLevel={section.level}
							characterJobType={character.jobType ?? 'default'}
							size={56}
						/>
					</div>
				)
			)}
		</div>
	);
};

export default SymbolsSection;
