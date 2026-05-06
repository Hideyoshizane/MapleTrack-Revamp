'use client';
import Image from 'next/image';
import { useRouter, usePathname, redirect } from 'next/navigation';
import { useState, useEffect } from 'react';

import ErrorPage from '@components/ErrorPage/ErrorPage';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import { getClassNameByCode } from '@data/classes/classes';
import { isValidServerName } from '@data/servers/servers';
import { getJob } from '@features/character/characterService';

import CharacterBossLegion from './components/CharacterBossLegion/CharacterBossLegion';
import { CharacterHeader } from './components/CharacterHeader/CharacterHeader';
import { CharacterImageAndSync } from './components/CharacterImageAndSync/CharacterImageAndSync';
import CharacterStats from './components/CharacterStats/CharacterStats';
import CharacterSymbol from './components/CharacterSymbol/CharacterSymbol';
import ValidatedInput from './components/ValidadeInput/ValidatedInput';
import { useCharacterInputs } from './hooks/useCharacterInputs';
import { useCharacterPageData } from './hooks/useCharacterPageData';
import styles from './Page.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { JSX } from 'react';

type Props = {
	server: string;
	code: string;
};

const CharacterPage = ({ server, code }: Props): JSX.Element => {
	const router = useRouter();
	const pathname = usePathname();

	const isServerValid = isValidServerName(server);

	const className = getClassNameByCode(code);
	if (!className || !isServerValid) {
		redirect('/error');
	}

	const [committedName, setCommittedName] = useState<string>();
	const [syncEnabled, setSyncEnabled] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);

	const { character, updateCharacter, loading, CharacterDataFromAPI, CharacterDataFromAPIFailed } =
		useCharacterPageData({ server, className, nameOverride: committedName, syncEnabled, setFirstLoad });

	useEffect(() => {
		if (character?.syncing && !syncEnabled) {
			setTimeout(() => setSyncEnabled(true), 0);
		}
	}, [character, syncEnabled]);

	const {
		levelInput,
		setLevelInput,
		targetLevelInput,
		setTargetLevelInput,
		nameError,
		handleNameBlur,
		toggleBossing,
		handleLevelBlur,
		handleTargetLevelBlur,
		toggleSync,
	} = useCharacterInputs({ character, updateCharacter, setSyncEnabled });

	if (loading && firstLoad) {
		return (
			<section className="mainContent">
				<FullPageLoader />
			</section>
		);
	}

	if (!character) {
		return (
			<section className="mainContent">
				<ErrorPage />
			</section>
		);
	}

	const level = character.level;
	const targetLevel = character.targetLevel;
	const jobType = character.jobType as JobType;
	const charClass = character.class;
	const legion = character.legion;
	const linkSkill = character.linkSkill;
	const job = getJob(level);

	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<Image
					alt={`${character.class} class profile Icon`}
					height={827}
					priority
					quality={100}
					src={`/assets/profile/${code}.webp`}
					width={650}
				/>

				<div className={styles.characterContent}>
					<CharacterHeader
						character={character}
						nameError={nameError}
						onDiscard={(): void => router.push(pathname.replace(/\/edit$/, ''))}
						server={server}
						setSubmitLoading={(): void => {}}
						submitLoading={false}
					/>

					<div className={styles.usernameLine}>
						<CharacterImageAndSync
							character={character}
							CharacterDataFromAPI={CharacterDataFromAPI}
							CharacterDataFromAPIFailed={CharacterDataFromAPIFailed}
							syncEnabled={syncEnabled}
							toggleSync={toggleSync}
						/>
						<ValidatedInput
							error={nameError}
							onBlur={(value) => {
								handleNameBlur(value);
								setCommittedName(value);
							}}
							onCommit={(value) => {
								handleNameBlur(value);
								setCommittedName(value);
							}}
							placeholder={character.name ?? 'Character Name'}
							value={committedName ?? ''}
						/>
					</div>

					<div className={styles.bigBlock}>
						<CharacterBossLegion
							character={character}
							code={code ?? ''}
							jobType={jobType}
							legion={legion ?? ''}
							linkSkill={linkSkill ?? ''}
							toggleBossing={toggleBossing}
						/>

						<div className={styles.characterClassJob}>
							<p className={styles.characterClass}>{charClass}</p>
							<p className={styles.characterJob}>{job}</p>
						</div>
					</div>

					<CharacterStats
						character={character}
						handleLevelBlur={handleLevelBlur}
						handleTargetLevelBlur={handleTargetLevelBlur}
						jobType={jobType}
						level={level}
						levelInput={levelInput}
						setLevelInput={setLevelInput}
						setTargetLevelInput={setTargetLevelInput}
						targetLevel={targetLevel}
						targetLevelInput={targetLevelInput}
					/>
					<CharacterSymbol
						character={character}
						characterJobType={jobType}
						characterLevel={level}
						updateCharacter={updateCharacter}
					/>
				</div>
			</div>
		</section>
	);
};

export default CharacterPage;
