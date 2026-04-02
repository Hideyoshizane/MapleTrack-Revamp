'use client';
import Image from 'next/image';
import { useRouter, usePathname, redirect } from 'next/navigation';
import { useState, useEffect } from 'react';

import ErrorPage from '@components/ErrorPage/ErrorPage';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import { getClassNameByCode } from '@data/classes/classes';
import { getJob } from '@features/character/characterAttributes';

import CharacterBossLegion from './components/CharacterBossLegion/CharacterBossLegion';
import { CharacterHeader } from './components/CharacterHeader/CharacterHeader';
import { CharacterImageAndSync } from './components/CharacterImageAndSync/CharacterImageAndSync';
import CharacterStats from './components/CharacterStats/CharacterStats';
import CharacterSymbol from './components/CharacterSymbol/CharacterSymbol';
import ValidatedInput from './components/ValidadeInput/ValidatedInput';
import { useCharacterInputs } from './hooks/useCharacterInputs';
import { useCharacterPageData } from './hooks/useCharacterPageData';
import styles from './page.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { JSX } from 'react';

type CharacterPageProps = {
	userOrigin: string;
	server: string;
	code: string;
};

const CharacterPage = ({ userOrigin, server, code }: CharacterPageProps): JSX.Element => {
	const router = useRouter();
	const pathname = usePathname();

	const className = getClassNameByCode(code);
	if (!className) {
		redirect('/error');
	}

	const [committedName, setCommittedName] = useState<string>();
	const [syncEnabled, setSyncEnabled] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);

	const { character, updateCharacter, loading, CharacterDataFromAPI, CharacterDataFromAPIFailed } =
		useCharacterPageData({
			server,
			className,
			nameOverride: committedName,
			syncEnabled,
			setFirstLoad,
		});

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
		return <FullPageLoader />;
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
					src={`/assets/profile/${code}.webp`}
					width={650}
					height={827}
					quality={100}
					priority
					alt={`${character.class} class profile Icon`}
				/>

				<div className={styles.characterContent}>
					<CharacterHeader
						character={character}
						userOrigin={userOrigin}
						server={server}
						className={className}
						nameError={nameError}
						submitLoading={false}
						setSubmitLoading={(): void => {}}
						onDiscard={(): void => router.push(pathname.replace(/\/edit$/, ''))}
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
							value={committedName ?? ''}
							placeholder={character.name ?? 'Character Name'}
							error={nameError}
							onBlur={(value) => {
								handleNameBlur(value);
								setCommittedName(value);
							}}
							onCommit={(value) => {
								handleNameBlur(value);
								setCommittedName(value);
							}}
						/>
					</div>

					<div className={styles.bigBlock}>
						<CharacterBossLegion
							character={character}
							toggleBossing={toggleBossing}
							linkSkill={linkSkill ?? ''}
							code={code ?? ''}
							jobType={jobType}
							legion={legion ?? ''}
						/>

						<div className={styles.characterClassJob}>
							<p className={styles.characterClass}>{charClass}</p>
							<p className={styles.characterJob}>{job}</p>
						</div>
					</div>

					<CharacterStats
						levelInput={levelInput}
						setLevelInput={setLevelInput}
						targetLevelInput={targetLevelInput}
						setTargetLevelInput={setTargetLevelInput}
						character={character}
						handleLevelBlur={handleLevelBlur}
						handleTargetLevelBlur={handleTargetLevelBlur}
						level={level}
						targetLevel={targetLevel}
						jobType={jobType}
					/>
					<CharacterSymbol
						characterLevel={level}
						characterJobType={jobType}
						character={character}
						updateCharacter={updateCharacter}
					/>
				</div>
			</div>
		</section>
	);
};

export default CharacterPage;
