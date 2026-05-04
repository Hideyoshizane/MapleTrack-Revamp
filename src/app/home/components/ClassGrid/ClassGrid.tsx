'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import ErrorPage from '@components/ErrorPage/errorPage';
import { SkeletonWrapper } from '@components/SkeletonWrapper/skeletonWrapper';
import { JobClasses } from '@data/classes/classes';
import { characterApi } from '@features/character/characterApi';
import { generateCharacterObjectHomePage } from '@features/character/characterService';

import ClassCard from './ClassCard/classCard';
import styles from './classGrid.module.scss';

import type { GetAllCharactersRequestBody } from '@features/character/schemas/character.request.schema';
import type { getAllCharactersResponseBody } from '@features/character/schemas/character.response.schema';
import type { ClassFilterOption } from '@utils/classFilterCookie';
import type { JSX } from 'react';

const CLASS_ORDER = ['mage', 'warrior', 'thief', 'bowman', 'pirate'];

const filterCharacters = (
	results: getAllCharactersResponseBody[],
	selectedClasses: ClassFilterOption[],
): getAllCharactersResponseBody[] => {
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

const sortCharacters = (characters: getAllCharactersResponseBody[]): getAllCharactersResponseBody[] => {
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

type Props = {
	serverCookie: string | undefined;
	selectedClasses: ClassFilterOption[];
	selectedClassesLoading: boolean;
};

const ClassGrid = ({ serverCookie, selectedClasses, selectedClassesLoading }: Props): JSX.Element => {
	const router = useRouter();

	const [allCharacters, setAllCharacters] = useState<getAllCharactersResponseBody[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const skeletons: JSX.Element[] = JobClasses.map(
		(job): JSX.Element => (
			<div className={styles.skeletonWrapper} key={job.className}>
				<SkeletonWrapper color="light" height={368} variant="rounded" width={502} />
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

			const fetchedCharacters: getAllCharactersResponseBody[] = Array.isArray(response.data) ? response.data : [];

			const results: getAllCharactersResponseBody[] = JobClasses.map((job): getAllCharactersResponseBody => {
				const match = fetchedCharacters.find((char): boolean => char.class === job.className);
				return (
					match ??
					generateCharacterObjectHomePage({
						jobClassName: job.className,
						jobType: job.jobType,
						legion: job.legionType,
						linkSkill: job.linkSkill,
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
	}, [serverCookie]);

	const jobResults: getAllCharactersResponseBody[] = sortCharacters(filterCharacters(allCharacters, selectedClasses));

	if (error) {
		return <ErrorPage />;
	}

	return (
		<div className={styles.classGrid}>
			{loading || selectedClassesLoading
				? skeletons
				: jobResults.map(
						(char): JSX.Element => <ClassCard character={char} key={char.class} serverCookie={serverCookie} />,
					)}
		</div>
	);
};

export default ClassGrid;
