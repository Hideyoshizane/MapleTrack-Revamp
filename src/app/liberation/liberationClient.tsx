'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useState, useEffect } from 'react';

import DestinyIcon from '@assets/svg/destiny.svg';
import GenesisIcon from '@assets/svg/genesis.svg';
import ErrorPage from '@components/ErrorPage/errorPage';
import FullPageLoader from '@components/FullPageLoader/fullPageLoader';
import ServerDropdown from '@components/ServerDropdown/serverDropdown';
import { liberationApi } from '@features/liberation/liberationApi';
import { useServerCookie } from '@hooks/useServerCookie';

import CharacterSelectBossDropdown from './components/CharacterSelectDropdown/characterSelectBossDropdown';
import GenesisProgression from './components/GenesisProgression/genesisProgression';
import styles from './page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type {
	getLiberationListResponseBody,
	GetLiberationListCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type LiberationClientProps = {
	initialServer: ServerName;
};

const LiberationClient = ({ initialServer }: LiberationClientProps): JSX.Element => {
	const { server, setServerCookie } = useServerCookie(initialServer);

	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);

	const [liberationList, setLiberationList] = useState<getLiberationListResponseBody | null>(null);
	const [selectedCharacter, setSelectedCharacter] = useState<GetLiberationListCharacterResponseBody | null>(null);

	useEffect(() => {
		const fetchLiberationList = async (): Promise<void> => {
			setLoading(true);
			setError(false);

			try {
				const payload = { server };
				const response = await liberationApi.getLiberationList(payload);

				if (response.success && response.data) {
					setLiberationList(response.data);
					setSelectedCharacter(response.data.characters[0] || null);
				} else {
					setError(true);
				}
			} catch (error) {
				console.error(error);
				setError(true);
			} finally {
				setLoading(false);
			}
		};
		void fetchLiberationList();
	}, [server]);

	useEffect(() => {
		if (!liberationList || !selectedCharacter) {
			return;
		}

		const freshCharacter = liberationList.characters.find((character) => character.name === selectedCharacter.name);
		if (freshCharacter && freshCharacter !== selectedCharacter) {
			setSelectedCharacter(freshCharacter);
		}
	}, [liberationList, selectedCharacter]);

	if (loading) {
		return (
			<section className="mainContent">
				<p className={styles.title}>Liberation Progress Hub </p>
				<div className={styles.serverDropdown}>
					<ServerDropdown server={server} setServerCookie={setServerCookie} />
				</div>
				<FullPageLoader />
			</section>
		);
	}

	if (error || !liberationList) {
		return (
			<section className="mainContent">
				<ErrorPage />
			</section>
		);
	}

	const characters = liberationList.characters;
	const ICON_SIZE = 32;

	return (
		<section className="mainContent">
			<p className={styles.title}>Liberation Progress Hub </p>
			<div className={styles.serverDropdown}>
				<ServerDropdown server={server} setServerCookie={setServerCookie} />
			</div>

			<div className={styles.characterDropdown}>
				<CharacterSelectBossDropdown
					characters={characters}
					selectedCharacter={selectedCharacter}
					setSelectedCharacter={setSelectedCharacter}
				/>
			</div>

			<Tabs.Root defaultValue="tab1">
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
						selectedCharacter={selectedCharacter}
						server={server}
					/>
				</Tabs.Content>

				<Tabs.Content value="tab2">{/* <ComponentTwo /> */}</Tabs.Content>
			</Tabs.Root>
		</section>
	);
};

export default LiberationClient;
