'use client';

import * as Tabs from '@radix-ui/react-tabs';

import DestinyIcon from '@assets/svg/destiny.svg';
import GenesisIcon from '@assets/svg/genesis.svg';
import ErrorIcon from '@assets/svg/octagon-x.svg';
import FullPageLoader from '@components/FullPageLoader/fullPageLoader';
import ServerDropdown from '@components/ServerDropdown/serverDropdown';
import { useServerCookie } from '@hooks/useServerCookie';

import CharacterSelectBossDropdown from './components/CharacterSelectDropdown/characterSelectBossDropdown';
import DestinyProgression from './components/DestinyProgression/destinyProgression';
import GenesisProgression from './components/GenesisProgression/genesisProgression';
import { useLiberation } from './hooks/useLiberation';
import styles from './page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type { JSX } from 'react';

type Props = {
	initialServer: ServerName;
};

const LiberationClient = ({ initialServer }: Props): JSX.Element => {
	const { server, setServerCookie } = useServerCookie(initialServer);

	const {
		loading,
		error,
		liberationList,
		selectedCharacter,
		activeTab,
		setSelectedCharacter,
		handleCharacterUpdate,
		handleTabChange,
	} = useLiberation(server);

	if (loading) {
		return (
			<section className="mainContent">
				<p className={styles.title}>Liberation Progress Hub</p>
				<div className={styles.serverDropdown}>
					<ServerDropdown server={server} setServerCookie={setServerCookie} />
				</div>
				<FullPageLoader />
			</section>
		);
	}

	if (error || !liberationList) {
		const BOSS_ICON_SIZE = 96;

		return (
			<section className="mainContent">
				<p className={styles.title}>Liberation Progress Hub</p>

				<div className={styles.serverDropdown}>
					<ServerDropdown server={server} setServerCookie={setServerCookie} />
				</div>

				<div className={styles.wrapper}>
					<div className={styles.notFoundList}>
						<ErrorIcon className={styles.errorIcon} height={BOSS_ICON_SIZE} width={BOSS_ICON_SIZE} />

						<p className={styles.title}>No character found!</p>

						<p className={styles.text}>You haven&apos;t marked any characters as Boss Slayer yet.</p>

						<p className={styles.text}>Go to your desired character and set it as a Boss Slayer to see them here.</p>
					</div>
				</div>
			</section>
		);
	}

	const ICON_SIZE = 32;

	return (
		<section className="mainContent">
			<p className={styles.title}>Liberation Progress Hub</p>

			<div className={styles.serverDropdown}>
				<ServerDropdown server={server} setServerCookie={setServerCookie} />
			</div>

			<div className={styles.characterDropdown}>
				<CharacterSelectBossDropdown
					characters={liberationList.characters}
					selectedCharacter={selectedCharacter}
					setSelectedCharacter={setSelectedCharacter}
				/>
			</div>

			<Tabs.Root onValueChange={handleTabChange} value={activeTab}>
				<Tabs.List className={styles.tabHolder}>
					<Tabs.Trigger className={styles.tabButton} value="tab1">
						<GenesisIcon className={styles.icon} height={ICON_SIZE} width={ICON_SIZE} />
						Genesis Liberation
					</Tabs.Trigger>

					<Tabs.Trigger className={styles.tabButton} value="tab2">
						<DestinyIcon className={styles.icon} height={ICON_SIZE} width={ICON_SIZE} />
						Destiny Liberation
					</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content className={styles.tabContent} value="tab1">
					<GenesisProgression
						currentDate={liberationList.liberationLastUpdate}
						onCharacterUpdate={handleCharacterUpdate}
						selectedCharacter={selectedCharacter}
						server={server}
					/>
				</Tabs.Content>

				<Tabs.Content className={styles.tabContent} value="tab2">
					<DestinyProgression
						currentDate={liberationList.liberationLastUpdate}
						onCharacterUpdate={handleCharacterUpdate}
						selectedCharacter={selectedCharacter}
						server={server}
					/>
				</Tabs.Content>
			</Tabs.Root>
		</section>
	);
};

export default LiberationClient;
