'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useState, useEffect, useRef } from 'react';

import DestinyIcon from '@assets/svg/destiny.svg';
import GenesisIcon from '@assets/svg/genesis.svg';
import ErrorPage from '@components/ErrorPage/errorPage';
import FullPageLoader from '@components/FullPageLoader/fullPageLoader';
import ServerDropdown from '@components/ServerDropdown/serverDropdown';
import { liberationApi } from '@features/liberation/liberationApi';
import { useServerCookie } from '@hooks/useServerCookie';

import CharacterSelectBossDropdown from './components/CharacterSelectDropdown/characterSelectBossDropdown';
import DestinyProgression from './components/DestinyProgression/destinyProgression';
import GenesisProgression from './components/GenesisProgression/genesisProgression';
import { useLiberationSyncPayload } from './lib/useSyncPayload';
import styles from './page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type {
	getLiberationListResponseBody,
	GetLiberationListCharacterResponseBody,
} from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

const getTabFromCharacter = (character: GetLiberationListCharacterResponseBody | null): string => {
	if (!character) {
		return 'tab1';
	}

	return character.liberated ? 'tab2' : 'tab1';
};

type Props = {
	initialServer: ServerName;
};

const LiberationClient = ({ initialServer }: Props): JSX.Element => {
	const { server, setServerCookie } = useServerCookie(initialServer);

	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);

	const [liberationList, setLiberationList] = useState<getLiberationListResponseBody | null>(null);
	const [selectedCharacter, setSelectedCharacter] = useState<GetLiberationListCharacterResponseBody | null>(null);

	const [activeTab, setActiveTab] = useState<string>('tab1');

	const sync = useLiberationSyncPayload({
		liberationList,
		onServerSync: (updatedCharacter) => {
			setLiberationList((prev) => {
				if (!prev) {
					return prev;
				}

				return {
					...prev,
					characters: prev.characters.map((char) =>
						char.characterId === updatedCharacter.characterId ? { ...char, ...updatedCharacter } : char,
					),
				};
			});

			setSelectedCharacter((prev) =>
				prev && prev.characterId === updatedCharacter.characterId ? { ...prev, ...updatedCharacter } : prev,
			);
		},
	});

	const isManualTabChangeRef = useRef<boolean>(false);

	useEffect(() => {
		document.body.style.cursor = sync.isSyncing ? 'wait' : 'default';
	}, [sync.isSyncing]);

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

	useEffect(() => {
		if (!selectedCharacter || isManualTabChangeRef.current) {
			return;
		}

		setActiveTab(getTabFromCharacter(selectedCharacter));
	}, [selectedCharacter?.characterId]);

	const handleCharacterSelect = (character: GetLiberationListCharacterResponseBody): void => {
		isManualTabChangeRef.current = true;

		setSelectedCharacter(character);
		setActiveTab(getTabFromCharacter(character));

		setTimeout(() => {
			isManualTabChangeRef.current = false;
		}, 100);
	};

	const handleCharacterUpdate = (updatedCharacter: Partial<GetLiberationListCharacterResponseBody>): void => {
		if (!liberationList || !selectedCharacter || isManualTabChangeRef.current) {
			return;
		}

		const current = selectedCharacter;

		const hasRealChange =
			(updatedCharacter.currentGenesisQuest !== undefined &&
				updatedCharacter.currentGenesisQuest !== current.currentGenesisQuest) ||
			(updatedCharacter.currentGenesisPoints !== undefined &&
				updatedCharacter.currentGenesisPoints !== current.currentGenesisPoints) ||
			(updatedCharacter.currentDestinyQuest !== undefined &&
				updatedCharacter.currentDestinyQuest !== current.currentDestinyQuest) ||
			(updatedCharacter.currentDestinyPoints !== undefined &&
				updatedCharacter.currentDestinyPoints !== current.currentDestinyPoints) ||
			(updatedCharacter.genesisPass !== undefined && updatedCharacter.genesisPass !== current.genesisPass) ||
			(updatedCharacter.liberated !== undefined && updatedCharacter.liberated !== current.liberated);

		if (!hasRealChange) {
			return;
		}

		setLiberationList((prev) => {
			if (!prev) {
				return prev;
			}

			return {
				...prev,
				characters: prev.characters.map((char) =>
					char.characterId === current.characterId ? { ...char, ...updatedCharacter } : char,
				),
			};
		});

		setSelectedCharacter((prev) => (prev ? { ...prev, ...updatedCharacter } : prev));

		sync.scheduleSync(current.characterId);
	};

	const handleTabChange = (newTab: string): void => {
		isManualTabChangeRef.current = true;
		setActiveTab(newTab);

		setTimeout(() => {
			isManualTabChangeRef.current = false;
		}, 100);
	};

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
					setSelectedCharacter={handleCharacterSelect}
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
