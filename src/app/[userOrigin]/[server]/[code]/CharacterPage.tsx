'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { getJob } from '@/utils/character/getJob';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import { useCharacterData } from '@hooks/useCharacterData';
import { useExtraCharacterData } from '@hooks/useExtraCharacterData';

import CharacterHeader from './components/CharacterHeader/CharacterHeader';
import CharacterStats from './components/CharacterStats/CharacterStats';
import SymbolsSection from './components/SymbolsSection/SymbolsSection';
import styles from './page.module.scss';
import { useBonusContext } from './useBonusContext';

import type { LevelUpResult } from '@/data/symbols/symbolMappings';
import type { CharacterContent, CharacterSymbol } from '@/models/character';
import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { JSX } from 'react';

interface CharacterPageProps {
	userOrigin: string;
	server: string;
	code: string;
}

export interface UpdateCharacterResponse {
	success: boolean;
	message: string;
	data: Record<string, LevelUpResult>;
}

const CharacterPage = ({ userOrigin, server, code }: CharacterPageProps): JSX.Element => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams.get('success');

	useEffect((): void => {
		if (success === '1') {
			toast.success('Character updated successfully!');
			const basePath = window.location.pathname;
			router.replace(basePath, { scroll: false });
		}
	}, [success, router]);

	const { character, loading: characterLoading, error, setCharacter } = useCharacterData({ userOrigin, server, code });
	const { extraData } = useExtraCharacterData({ character, server, characterLoading });
	const [disableAllDaily, setDisableAllDaily] = useState<boolean>(false);

	const { arcaneBonus, sacredBonus } = useBonusContext();

	// Redirect to /error if done loading and no character
	if (!characterLoading && !character) return <FullPageLoader />;
	if (error) throw new Error(error);

	if (!character) {
		return <FullPageLoader />;
	}

	const job = getJob(character.level);
	const jobType: JobType = (character.jobType ?? 'default') as JobType;

	const handleIncreaseAll = async (): Promise<void> => {
		try {
			// Compute URL segments here, local to this function
			const pathname = window.location.pathname;
			const [userOrigin, server, code] = pathname.split('/').filter(Boolean);

			const payload = { userOrigin, server, code, arcaneBonus, sacredBonus };

			const res = await fetch('/api/characters/updateAllDaily', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const data: UpdateCharacterResponse = await res.json();
			if (data.success) {
				const updatedCharacter = {
					...character,
					ArcaneSymbol: character.ArcaneSymbol.map((symbol): CharacterSymbol => {
						const result = data.data[symbol.name];
						if (!result) return symbol;
						return {
							...symbol,
							level: result.currentLevel,
							exp: result.currentExp,
							content: symbol.content.map(
								(c, idx): CharacterContent => (idx === 0 ? { ...c, cleared: true, date: new Date() } : c)
							),
						};
					}),
					SacredSymbol: character.SacredSymbol.map((symbol): CharacterSymbol => {
						const result = data.data[symbol.name];
						if (!result) return symbol;
						return {
							...symbol,
							level: result.currentLevel,
							exp: result.currentExp,
							content: symbol.content.map(
								(c, idx): CharacterContent => (idx === 0 ? { ...c, cleared: true, date: new Date() } : c)
							),
						};
					}),
					GrandSacredSymbol: character.GrandSacredSymbol.map((symbol): CharacterSymbol => {
						const result = data.data[symbol.name];
						if (!result) return symbol;
						return {
							...symbol,
							level: result.currentLevel,
							exp: result.currentExp,
							content: symbol.content.map(
								(c, idx): CharacterContent => (idx === 0 ? { ...c, cleared: true, date: new Date() } : c)
							),
						};
					}),
				};
				setCharacter(updatedCharacter);
				setDisableAllDaily(true);

				toast.success('All symbols updated successfully!');
			}
		} catch (error) {
			console.error('Error updating Weekly: ', error);
		}
	};

	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<Image
					src={`/assets/profile/${character.code}.webp`}
					width={650}
					height={827}
					priority
					alt={`${character.class} class profile Icon`}
				/>
				<div className={styles.characterContent}>
					<CharacterHeader
						character={character}
						extraData={extraData}
						router={router}
						handleIncreaseAll={handleIncreaseAll}
					/>
					<CharacterStats character={character} job={job} jobType={jobType} />
					<SymbolsSection character={character} disableAllDaily={disableAllDaily} />
				</div>
			</div>
		</section>
	);
};

export default CharacterPage;
