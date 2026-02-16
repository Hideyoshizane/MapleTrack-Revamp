'use client';

import { getCharacterSymbolSections, type SymbolSection } from '@features/character/characterAttributes';

import styles from './CharacterSymbol.module.scss';
import EditPageSymbolGrid from './EditPageSymbolGrid/EditPageSymbolGrid';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { JSX } from 'react';

type SymbolGridsProps = {
	characterLevel: number;
	characterJobType: JobType;
	character?: Character;
	updateCharacter: (recipe: (draft: Character) => void) => void;
};

const SymbolGrids = ({
	characterLevel,
	characterJobType,
	character,
	updateCharacter,
}: SymbolGridsProps): JSX.Element => {
	if (!character) {
		return <div />;
	}

	const symbolSections: SymbolSection[] = getCharacterSymbolSections(character);

	return (
		<div className={styles.symbols}>
			{symbolSections.map((section) => (
				<div key={section.type}>
					<p className={styles.title}>{section.title}</p>
					<EditPageSymbolGrid
						type={section.type}
						symbols={section.symbols}
						characterLevel={characterLevel}
						characterJobType={characterJobType}
						size={56}
						updateCharacter={updateCharacter}
					/>
				</div>
			))}
		</div>
	);
};

export default SymbolGrids;
