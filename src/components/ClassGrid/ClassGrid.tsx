'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { JobClasses } from '@data/classes/classes';
import { characterApi } from '@features/character/characterApi';
import { generateCharacterObject } from '@features/character/characterService';

import ClassCard from './ClassCard/ClassCard';
import styles from './ClassGrid.module.scss';

import type { GetAllCharactersRequestBody } from '@features/character/characterApi';
import type { CharacterDraft as Character } from '@features/character/characterModel';
import type { ClassFilterOption } from '@utils/classFilterCookie';
import type { JSX } from 'react';

const CLASS_ORDER = ['mage', 'warrior', 'thief', 'bowman', 'pirate'];

type ClassGridProps = {
	serverCookie: string | undefined;
	selectedClasses: ClassFilterOption[];
	selectedClassesLoading: boolean;
};

const filterCharacters = (results: Character[], selectedClasses: ClassFilterOption[]): Character[] => {
	return results.filter((char): boolean => {
		if (!selectedClasses.length) {
			return true;
		}

		if (char.bossing && selectedClasses.includes('bossing')) {
			return true;
		}

		if (char.jobType === 'xenon' && (selectedClasses.includes('pirate') || selectedClasses.includes('thief'))) {
			return true;
		}

		return selectedClasses.includes(char.jobType as ClassFilterOption);
	});
};

const sortCharacters = (characters: Character[]): Character[] => {
	return [...characters].sort((a, b): number => {
		const aType = a.jobType === 'xenon' ? 'thief' : (a.jobType ?? 'zzz');
		const bType = b.jobType === 'xenon' ? 'thief' : (b.jobType ?? 'zzz');

		const aIndex = CLASS_ORDER.indexOf(aType);
		const bIndex = CLASS_ORDER.indexOf(bType);

		if (aIndex !== bIndex) {
			return aIndex - bIndex;
		}
		return (a.class ?? '').localeCompare(b.class ?? '');
	});
};

const ClassGrid = ({ serverCookie, selectedClasses, selectedClassesLoading }: ClassGridProps): JSX.Element => {
	const router = useRouter();

	const [allCharacters, setAllCharacters] = useState<Character[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const skeletons: JSX.Element[] = JobClasses.map(
		(job): JSX.Element => (
			<div key={job.className} className={styles.skeletonWrapper}>
				<SkeletonWrapper width={502} height={368} color="light" variant="rounded" />
			</div>
		),
	);

	const fetchCharacters = async (): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			if (!serverCookie) {
				router.replace('/error');
				return;
			}

			const payload: GetAllCharactersRequestBody = { server: serverCookie };

			const response = await characterApi.getAllCharacters(payload);
			if (!response.success) {
				throw new Error(response.message ?? 'Failed to fetch characters');
			}

			const fetchedCharacters: Character[] = Array.isArray(response.data) ? response.data : [];

			const results: Character[] = JobClasses.map((job): Character => {
				const match = fetchedCharacters.find((char): boolean => char.class === job.className);
				return (
					match ??
					generateCharacterObject({
						jobClassName: job.className,
						jobType: job.jobType,
						legion: job.legionType,
						code: job.code,
						linkSkill: job.linkSkill,
						server: serverCookie,
					})
				);
			});

			setAllCharacters(results);
		} catch (err: unknown) {
			console.error('Error fetching characters:', err);
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	};

	useEffect((): void => {
		if (!serverCookie) {
			return;
		}

		void fetchCharacters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverCookie]);

	const jobResults: Character[] = sortCharacters(filterCharacters(allCharacters, selectedClasses));

	if (error) {
		return (
			<div className={styles.error}>
				<p>Error: {error}</p>
				<button onClick={(): undefined => void fetchCharacters()}>Retry</button>
			</div>
		);
	}

	return (
		<div className={styles.classGrid}>
			{loading || selectedClassesLoading
				? skeletons
				: jobResults.map((char): JSX.Element => <ClassCard key={char.class} character={char} />)}
		</div>
	);
};

export default ClassGrid;
