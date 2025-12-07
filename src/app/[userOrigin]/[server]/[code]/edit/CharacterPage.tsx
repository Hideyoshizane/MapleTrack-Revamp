'use client';
import { clsx } from 'clsx';
import Image from 'next/image';
import { notFound, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// Assets
import BossIcon from '@assets/svg/boss_slayer.svg';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
// Components
import LegionBlock from '@components/LegionBlock/LegionBlock';
import LinkSkillBlock from '@components/LinkSkillBlock/LinkSkillBlock';
import Tooltip from '@components/Tooltip/Tooltip';

// Local Components
import { CharacterHeader } from './components/CharacterHeader/CharacterHeader';
import { CharacterImageAndSync } from './components/CharacterImageAndSync/CharacterImageAndSync';
import CharacterStats from './components/CharacterStats/CharacterStats';
import CharacterSymbol from './components/CharacterSymbol/CharacterSymbol';
// Hooks
import { useCharacterDerived } from './hooks/useCharacterDerived';
import { useCharacterInputs } from './hooks/useCharacterInputs';
import { useCharacterPageData } from './hooks/useCharacterPageData';
// Styling
import styles from './page.module.scss';

// Types
import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { Character } from '@sharedTypes/character';
import type { JSX } from 'react';

interface CharacterPageProps {
	userOrigin: string;
	server: string;
	code: string;
}

const BOSS_ICON_SIZE = 90;
const ICON_SIZE = 64;

// Helper Components
interface ValidatedInputProps {
	value?: string;
	placeholder?: string;
	error?: string | null;
	onBlur?: (value: string) => void;
	onCommit?: (value: string) => void;
}

const ValidatedInput = ({ value, placeholder, error, onBlur, onCommit }: ValidatedInputProps): JSX.Element => {
	// State to track current input value
	const [inputValue, setInputValue] = useState(value ?? '');

	// State to remember the original value before editing
	const [originalValue, setOriginalValue] = useState(value ?? '');

	useEffect((): void => {
		setInputValue(value ?? '');
		setOriginalValue(value ?? '');
	}, [value]);

	const handleChange = (val: string): void => {
		setInputValue(val);
	};
	// When user focuses the input: clear the field
	const handleFocus = (): void => {
		setInputValue('');
	};

	const handleBlur = (): void => {
		// If user left it empty, restore original value
		const finalValue = inputValue.trim() === '' ? originalValue : inputValue;

		setInputValue(finalValue);
		setOriginalValue(finalValue);

		// Call external handlers
		onBlur?.(finalValue);
		onCommit?.(finalValue);
	};

	return (
		<Tooltip content={error} placement="left" enabled={!!error}>
			<input
				className={clsx(styles.characterName, { [styles.invalid]: !!error })}
				value={inputValue}
				placeholder={placeholder}
				onChange={(e): void => handleChange(e.target.value)}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
		</Tooltip>
	);
};

interface CharacterBossLegionProps {
	character: Character;
	toggleBossing: () => void;
	linkSkill: string;
	code: string;
	jobType: JobType;
	legion: string;
}

const CharacterBossLegion = ({
	character,
	toggleBossing,
	linkSkill,
	code,
	jobType,
	legion,
}: CharacterBossLegionProps): JSX.Element => (
	<div className={styles.characterBossLinkLegion}>
		<div className={styles.bossSlot}>
			<Tooltip content="Click to toggle Boss Slayer status" placement="bottom">
				<div onClick={toggleBossing} style={{ cursor: 'pointer' }}>
					<BossIcon
						width={BOSS_ICON_SIZE}
						height={BOSS_ICON_SIZE}
						className={clsx(styles.bossIcon, {
							[styles.on]: character.bossing,
							[styles.off]: !character.bossing,
						})}
					/>
				</div>
			</Tooltip>
		</div>
		<LinkSkillBlock characterLevel={character.level} characterLinkSkill={linkSkill} iconSize={ICON_SIZE} showTooltip />
		<LegionBlock
			characterLevel={character.level}
			characterCode={code}
			characterJobType={jobType}
			characterLegionType={legion}
			iconSize={ICON_SIZE}
			showTooltip
		/>
	</div>
);

const CharacterPage = ({ userOrigin, server, code }: CharacterPageProps): JSX.Element => {
	const router = useRouter();
	const pathname = usePathname();

	const {
		character: fetchedCharacter,
		committedName,
		setCommittedName,
		loading: pageLoading,
		error,
		extraData,
		extraDataFailed,
		handleSyncToggle,
	} = useCharacterPageData({
		userOrigin,
		server,
		code,
	});

	const inputsReady = !!fetchedCharacter;

	const {
		character,
		setCharacter,
		levelInput,
		setLevelInput,
		targetLevelInput,
		setTargetLevelInput,
		nameError,
		handleNameBlur,
		toggleBossing,
	} = useCharacterInputs(inputsReady ? fetchedCharacter : undefined);

	const derived = useCharacterDerived({ character });
	const { level, targetLevel, jobType, charClass, legion, linkSkill, job } = derived;

	if (pageLoading || !character) return <FullPageLoader />;
	if (error) throw new Error(error);
	if (!character) notFound();
	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<Image
					src={`/assets/profile/${character.code}.webp`}
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
						code={code}
						nameError={nameError}
						submitLoading={false}
						setSubmitLoading={(): void => {}}
						onDiscard={(): void => router.push(pathname.replace(/\/edit$/, ''))}
					/>

					<div className={styles.usernameLine}>
						<CharacterImageAndSync
							character={character}
							extraData={extraData}
							extraDataFailed={extraDataFailed}
							onSyncToggle={handleSyncToggle}
						/>
						<ValidatedInput
							value={committedName}
							placeholder="Character Name"
							error={nameError}
							onBlur={handleNameBlur}
							onCommit={setCommittedName}
						/>
					</div>

					<div className={styles.bigBlock}>
						<CharacterBossLegion
							character={character}
							toggleBossing={toggleBossing}
							linkSkill={linkSkill}
							code={character.code ?? ''}
							jobType={jobType}
							legion={legion}
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
						setCharacter={setCharacter}
						level={level}
						targetLevel={targetLevel}
						jobType={jobType}
					/>

					<CharacterSymbol
						characterLevel={level}
						characterJobType={jobType}
						character={character}
						setCharacter={setCharacter}
					/>
				</div>
			</div>
		</section>
	);
};

export default CharacterPage;
