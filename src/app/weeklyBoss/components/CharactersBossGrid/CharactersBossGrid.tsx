'use client';

import WeeklyBossDropdown from '../WeeklyBossDropdown/WeeklyBossDropdown';

import styles from './CharactersBossGrid.module.scss';

import type { BossCharacterDraft as BossCharacter } from '@features/Boss/bossListModel';
import type { JSX } from 'react';

type HandleBossToggle = (params: {
	characterCode: string;
	bossName: string;
	difficulty: string;
}) => void | Promise<void>;

type CharacterBossGridProps = {
	server: string;
	characterList: BossCharacter[];
	handleBossToggle: HandleBossToggle;
};

const CharactersBossGrid = ({ server, characterList }: CharacterBossGridProps): JSX.Element => {
	return (
		<div className={styles.classGrid}>
			{characterList.map((character): JSX.Element => {
				return <WeeklyBossDropdown key={character.name} character={character} server={server} />;
			})}
		</div>
	);
};
export default CharactersBossGrid;
