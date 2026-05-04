'use client';

import WeeklyBossDropdown from '../WeeklyBossDropdown/weeklyBossDropdown';

import styles from './charactersBossGrid.module.scss';

import type { getBossListCharacterResponseBody } from '@features/boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type HandleBossToggle = (bossMosterId: string) => void | Promise<void>;

type Props = {
	server: string;
	characterList: getBossListCharacterResponseBody[];
	handleBossToggle: HandleBossToggle;
};

const CharactersBossGrid = ({ server, characterList, handleBossToggle }: Props): JSX.Element => {
	return (
		<div className={styles.classGrid}>
			{characterList.map((character): JSX.Element => {
				return (
					<WeeklyBossDropdown
						character={character}
						handleBossToggle={handleBossToggle}
						key={character.name}
						server={server}
					/>
				);
			})}
		</div>
	);
};
export default CharactersBossGrid;
