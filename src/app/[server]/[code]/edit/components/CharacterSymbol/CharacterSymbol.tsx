'use client';
import styles from './characterSymbol.module.scss';
import EditPageSymbolGrid from './EditPageSymbolGrid/editPageSymbolGrid';

import type { JobType } from '@components/ProgressBar/progressBar';
import type { getEditCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { SymbolCategory } from '@prisma/client';
import type { JSX } from 'react';

type Props = {
	characterLevel: number;
	characterJobType: JobType;
	character?: getEditCharacterDataResponseBody;
	updateCharacter: (recipe: (draft: getEditCharacterDataResponseBody) => void) => void;
};

type SymbolSectionConfig = {
	type: SymbolCategory;
	title: string;
};

const SYMBOL_SECTIONS: readonly SymbolSectionConfig[] = [
	{ type: 'arcane', title: 'Arcane Symbols' },
	{ type: 'sacred', title: 'Sacred Symbols' },
	{ type: 'grand', title: 'Grand Sacred Symbols' },
] as const;

const SymbolGrids = ({ characterLevel, characterJobType, character, updateCharacter }: Props): JSX.Element => {
	if (!character) {
		return <div />;
	}

	return (
		<div className={styles.symbols}>
			{SYMBOL_SECTIONS.map(({ type, title }) => (
				<div key={type}>
					<p className={styles.title}>{title}</p>
					<EditPageSymbolGrid
						characterJobType={characterJobType}
						characterLevel={characterLevel}
						size={56}
						symbols={character.symbols[type]}
						type={type}
						updateCharacter={updateCharacter}
					/>
				</div>
			))}
		</div>
	);
};

export default SymbolGrids;
