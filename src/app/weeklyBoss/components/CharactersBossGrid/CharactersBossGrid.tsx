'use client';

import WeeklyBossDropdown from '../WeeklyBossDropdown/weeklyBossDropdown';

import styles from './charactersBossGrid.module.scss';

import type { getBossListCharacterResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type HandleBossToggle = (bossMosterId: string) => void | Promise<void>;

type CharacterBossGridProps = {
	server: string;
	characterList: getBossListCharacterResponseBody[];
	handleBossToggle: HandleBossToggle;
};

const CharactersBossGrid = ({ server, characterList, handleBossToggle }: CharacterBossGridProps): JSX.Element => {
	return (
		<div className={styles.classGrid}>
			{characterList.map((character): JSX.Element => {
				return (
					<WeeklyBossDropdown
						key={character.name}
						character={character}
						server={server}
						handleBossToggle={handleBossToggle}
					/>
				);
			})}
		</div>
	);
};
export default CharactersBossGrid;
